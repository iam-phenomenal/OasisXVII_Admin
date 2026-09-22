/**
 * Daily revenue time series.
 *
 * There is no time-series endpoint on the API yet — `/admin/dashboard/stats`
 * returns totals and status breakdowns only. This module is therefore backed by
 * a deterministic mock generator, but its signature and return shape are exactly
 * what the real endpoint will provide, so swapping it is a change to
 * `getDailyRevenue`'s body alone. See plans/009 for the proposed contract.
 *
 * Note this module must stay server-only: the eventual `adminFetch` call reads
 * the admin cookie, which is unavailable in the browser.
 */

export type DailyRevenuePoint = {
  /** ISO calendar date, UTC, e.g. "2026-08-29". Not a timestamp. */
  date: string;
  /** Summed `totalDue` for orders created that day, in NGN. */
  revenue: number;
  /** Order count for that day — shown in the tooltip, not plotted. */
  orders: number;
};

export type RangePreset = 7 | 14 | 30;

export type TransactionRange =
  | { kind: "preset"; days: RangePreset }
  | { kind: "custom"; from: string; to: string };

export const DEFAULT_RANGE: TransactionRange = { kind: "preset", days: 7 };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;
const MAX_CUSTOM_SPAN_DAYS = 365;

/** "2026-08-29" for a Date, always in UTC so bucketing never shifts by timezone. */
function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Today at UTC midnight — the anchor every range ends on. */
function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function todayKey(): string {
  return toDateKey(todayUtc());
}

/**
 * A date string is only valid if it both matches the shape and denotes a real
 * day. "2026-02-31" passes the regex but is not a date, and `Date.parse` on a
 * bare ISO date is UTC-based, so this stays consistent with `toDateKey`.
 */
function isValidDateKey(value: string | undefined): value is string {
  return (
    typeof value === "string" &&
    DATE_RE.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    toDateKey(new Date(value)) === value
  );
}

/**
 * Resolve raw search params into a range. Every malformed input degrades to the
 * 7-day default rather than throwing — these values come from a user-editable
 * URL, so a crash here would be trivially reachable.
 */
export function parseRange(params: {
  range?: string;
  from?: string;
  to?: string;
}): TransactionRange {
  const { range, from, to } = params;

  if (range === "7" || range === "14" || range === "30") {
    return { kind: "preset", days: Number(range) as RangePreset };
  }

  if (range === "custom" && isValidDateKey(from) && isValidDateKey(to)) {
    // Inverted range: the intent is unambiguous, so correct it rather than
    // silently resetting to the default.
    let start = from <= to ? from : to;
    const end = from <= to ? to : from;

    // Clamp an absurd span so a hand-edited URL can't request a 50,000-point
    // series and stall the render.
    const spanDays = (Date.parse(end) - Date.parse(start)) / MS_PER_DAY;
    if (spanDays > MAX_CUSTOM_SPAN_DAYS) {
      start = toDateKey(new Date(Date.parse(end) - MAX_CUSTOM_SPAN_DAYS * MS_PER_DAY));
    }

    return { kind: "custom", from: start, to: end };
  }

  return DEFAULT_RANGE;
}

/**
 * FNV-1a hash folded through a mulberry32-style finalizer. Seeded from the date
 * string so a given day always yields the same figure: the chart must not
 * reshuffle between renders, or it can't be eyeballed or screenshot-compared.
 */
function seededUnit(dateKey: string): number {
  let h = 2166136261;
  for (let i = 0; i < dateKey.length; i++) {
    h ^= dateKey.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^= h >>> 16) >>> 0) / 4294967296;
}

/** Shape one day's figures. Weekends lift; roughly one day in six is empty. */
function mockPoint(dateKey: string): DailyRevenuePoint {
  const base = seededUnit(dateKey);

  if (base < 0.18) {
    return { date: dateKey, revenue: 0, orders: 0 };
  }

  const day = new Date(dateKey).getUTCDay();
  const weekendLift = day === 0 || day === 6 ? 1.6 : 1;
  const revenue = Math.round(base * 9000 * weekendLift);

  // Derived, not independently random, so the tooltip's two numbers stay
  // plausible against each other.
  return { date: dateKey, revenue, orders: Math.max(1, Math.round(revenue / 2100)) };
}

/** Every calendar day in [start, end] inclusive, oldest first. */
function eachDay(start: Date, end: Date): string[] {
  const days: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += MS_PER_DAY) {
    days.push(toDateKey(new Date(t)));
  }
  return days;
}

export async function getDailyRevenue(
  range: TransactionRange,
): Promise<DailyRevenuePoint[]> {
  const end =
    range.kind === "custom" ? new Date(range.to) : todayUtc();
  const start =
    range.kind === "custom"
      ? new Date(range.from)
      : new Date(end.getTime() - (range.days - 1) * MS_PER_DAY);

  // Zero-filled by construction: every day in the span gets a point, so a gap
  // in orders renders as a gap in time. Dropping empty days would make Recharts
  // space the survivors evenly and quietly misstate the elapsed period.
  return eachDay(start, end).map(mockPoint);
}
