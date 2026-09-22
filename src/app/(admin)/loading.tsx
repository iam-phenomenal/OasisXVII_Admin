import { StatCardSkeleton } from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

import { DailyTransactionsCardSkeleton } from "./_components/DailyTransactionsCard";

export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Reused rather than re-approximated: the real card's height has to
          match exactly or the page jumps when the chart lands. */}
      <DailyTransactionsCardSkeleton />

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />
    </section>
  );
}
