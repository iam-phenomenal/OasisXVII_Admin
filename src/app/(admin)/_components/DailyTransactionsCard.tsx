import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getDailyRevenue,
  todayKey,
  type TransactionRange,
} from "@/lib/api/transactions";
import { formatPrice } from "@/lib/formatPrice";

import { DailyTransactionsChart } from "./DailyTransactionsChart";
import { TransactionsRangeFilter } from "./TransactionsRangeFilter";

type DailyTransactionsCardProps = {
  range: TransactionRange;
};

export async function DailyTransactionsCard({
  range,
}: DailyTransactionsCardProps) {
  // The mock can't fail, but the real endpoint will — degrade to a message
  // rather than taking the dashboard down with it, as the orders fetch does.
  const data = await getDailyRevenue(range).catch(() => null);

  const total = data?.reduce((sum, point) => sum + point.revenue, 0) ?? 0;

  return (
    <Card className="gap-0">
      <CardHeader className="border-b pb-4">
        <CardTitle>Daily revenue</CardTitle>
        {data === null ? null : (
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            {formatPrice(total, "NGN")}
          </p>
        )}
        <CardAction>
          <TransactionsRangeFilter range={range} today={todayKey()} />
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        {data === null ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            Couldn&apos;t load revenue data.
          </p>
        ) : (
          <DailyTransactionsChart data={data} />
        )}
      </CardContent>
    </Card>
  );
}

export function DailyTransactionsCardSkeleton() {
  return (
    <Card className="gap-0">
      <CardHeader className="border-b pb-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-28" />
        <CardAction>
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[26px] w-16 rounded-lg" />
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4">
        <Skeleton className="h-[240px] w-full" />
      </CardContent>
    </Card>
  );
}
