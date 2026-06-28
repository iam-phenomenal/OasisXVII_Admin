import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-[18px] w-[18px] rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />
    </section>
  );
}
