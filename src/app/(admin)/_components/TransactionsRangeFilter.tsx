"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RangePreset, TransactionRange } from "@/lib/api/transactions";
import { cn } from "@/lib/utils";

const PRESETS: { days: RangePreset; label: string }[] = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

// Copied from the orders page filter tabs so the two filters read as one system.
const PILL_BASE = "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors";
const PILL_ACTIVE = "bg-wine-glow/10 text-on-surface ring-1 ring-inset ring-wine-glow/20";
const PILL_IDLE = "text-muted-foreground hover:bg-surface-low hover:text-foreground";

// The native picker glyph renders dark-on-dark under this theme without it.
const DATE_INPUT = "w-[9.5rem] [&::-webkit-calendar-picker-indicator]:invert";

type TransactionsRangeFilterProps = {
  range: TransactionRange;
  /** Today as an ISO date key — passed from the server so the max attribute
   *  can't disagree with the series the server generated. */
  today: string;
};

export function TransactionsRangeFilter({
  range,
  today,
}: TransactionsRangeFilterProps) {
  const router = useRouter();
  const fromId = useId();
  const toId = useId();

  const isCustom = range.kind === "custom";
  // Open on mount when the active range is already custom, so a reload or a
  // shared URL doesn't hide the dates it's actually showing.
  const [showCustom, setShowCustom] = useState(isCustom);
  const [from, setFrom] = useState(isCustom ? range.from : "");
  const [to, setTo] = useState(isCustom ? range.to : "");

  function applyCustom() {
    if (!from || !to) return;
    router.push(`/?range=custom&from=${from}&to=${to}`);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-1">
        {PRESETS.map(({ days, label }) => (
          <Link
            key={days}
            href={`/?range=${days}`}
            onClick={() => setShowCustom(false)}
            aria-current={
              range.kind === "preset" && range.days === days ? "true" : undefined
            }
            className={cn(
              PILL_BASE,
              range.kind === "preset" && range.days === days
                ? PILL_ACTIVE
                : PILL_IDLE,
            )}
          >
            {label}
          </Link>
        ))}

        {/* A button, not a Link — there is nothing to fetch until both dates
            are chosen, so revealing the inputs must not navigate. */}
        <button
          type="button"
          onClick={() => setShowCustom((open) => !open)}
          aria-expanded={showCustom}
          className={cn(PILL_BASE, isCustom ? PILL_ACTIVE : PILL_IDLE)}
        >
          Custom
        </button>
      </div>

      {showCustom ? (
        <div className="flex flex-wrap items-end justify-end gap-2">
          <div className="space-y-1">
            <Label htmlFor={fromId} className="text-xs text-muted-foreground">
              From
            </Label>
            <Input
              id={fromId}
              type="date"
              value={from}
              max={to || today}
              onChange={(event) => setFrom(event.target.value)}
              className={DATE_INPUT}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={toId} className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id={toId}
              type="date"
              value={to}
              min={from || undefined}
              max={today}
              onChange={(event) => setTo(event.target.value)}
              className={DATE_INPUT}
            />
          </div>

          <Button size="sm" onClick={applyCustom} disabled={!from || !to}>
            Apply
          </Button>
        </div>
      ) : null}
    </div>
  );
}
