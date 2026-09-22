"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyRevenuePoint } from "@/lib/api/transactions";
import { formatPrice } from "@/lib/formatPrice";

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** "29 Aug" — matches the date rendering in RecentTransactionsTable. */
function formatAxisDate(dateKey: string): string {
  return new Date(dateKey).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * Compact naira for the Y axis — "₦27.5k", not "₦27,562". Full-precision ticks
 * cost ~90px of width and wrap; the tooltip carries the exact figure.
 */
function formatAxisNaira(value: number): string {
  if (value === 0) return "₦0";
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `₦${(value / 1_000).toFixed(1)}k`;
  return `₦${value}`;
}

type DailyTransactionsChartProps = {
  data: DailyRevenuePoint[];
};

export function DailyTransactionsChart({ data }: DailyTransactionsChartProps) {
  // An all-zero area chart is a flat line pinned to the axis and reads as
  // broken, so say so instead of drawing it.
  if (data.length === 0 || data.every((point) => point.revenue === 0)) {
    return (
      <p className="flex h-[240px] items-center justify-center px-4 py-10 text-center text-sm text-muted-foreground">
        No revenue in this period.
      </p>
    );
  }

  // Thin the date labels so ~8 survive at any range; 30 unthinned labels
  // overlap into mush.
  const tickInterval = Math.max(0, Math.ceil(data.length / 8) - 1);

  const orderCountByDate = new Map(data.map((p) => [p.date, p.orders]));

  return (
    <ChartContainer config={chartConfig} className="h-[240px] w-full">
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Horizontal rules only — vertical gridlines fight the sidebar edge. */}
        <CartesianGrid vertical={false} stroke="var(--border)" />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={tickInterval}
          tickFormatter={formatAxisDate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={formatAxisNaira}
        />

        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_label, payload) => {
                const dateKey = payload?.[0]?.payload?.date as
                  | string
                  | undefined;
                if (!dateKey) return null;
                return new Date(dateKey).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                });
              }}
              formatter={(value, _name, item) => {
                const dateKey = item?.payload?.date as string | undefined;
                const orders = dateKey ? orderCountByDate.get(dateKey) ?? 0 : 0;
                return (
                  <div className="flex flex-1 items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      {orders} {orders === 1 ? "order" : "orders"}
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatPrice(Number(value), "NGN")}
                    </span>
                  </div>
                );
              }}
            />
          }
        />

        {/*
          `monotone` never overshoots below zero between points. The series
          deliberately contains empty days, and `natural` would curve the line
          into negative revenue between them.
        */}
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
