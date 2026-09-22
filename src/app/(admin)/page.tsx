import { Clock, CreditCard, ReceiptText, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { StatCard } from "@/components/admin/StatCard";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardStats } from "@/lib/api/dashboard";
import { listOrders } from "@/lib/api/orders";
import { parseRange } from "@/lib/api/transactions";
import { getCurrentAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/formatPrice";

import {
  DailyTransactionsCard,
  DailyTransactionsCardSkeleton,
} from "./_components/DailyTransactionsCard";
import { RecentTransactionsTable } from "./_components/RecentTransactionsTable";

const STATS_CONFIG: { label: string; Icon: LucideIcon; key: "totalOrders" | "totalRevenue" | "activeProducts" | "pendingOrders" }[] = [
  { label: "Total orders", Icon: ReceiptText, key: "totalOrders" },
  { label: "Total revenue", Icon: CreditCard, key: "totalRevenue" },
  { label: "Active products", Icon: Tag, key: "activeProducts" },
  { label: "Pending orders", Icon: Clock, key: "pendingOrders" },
];

type DashboardPageProps = {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const range = parseRange(await searchParams);

  // `/admin/orders` failing must not cost the admin their stat cards, so this
  // one call is caught to null rather than rejecting the whole Promise.all.
  // null (not []) keeps "the call failed" distinct from "there are no orders".
  const [admin, s, recentOrders] = await Promise.all([
    getCurrentAdmin(),
    getDashboardStats(),
    listOrders({ limit: 20 }).catch(() => null),
  ]);

  // `GET /admin/orders` documents no ordering guarantee and exposes no sort
  // param, so fetch a window and sort defensively here.
  const recent =
    recentOrders === null
      ? null
      : [...recentOrders]
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
          .slice(0, 5);

  const statValues: Record<string, string | number> = {
    totalOrders: s.totalOrders,
    totalRevenue: formatPrice(s.totalRevenue, "NGN"),
    activeProducts: s.productsByStatus.active,
    pendingOrders: s.ordersByStatus.pending,
  };

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Overview
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CONFIG.map(({ label, Icon, key }) => (
          <StatCard
            key={label}
            label={label}
            Icon={Icon}
            value={statValues[key]}
          />
        ))}
      </div>

      {/* Suspense keeps this fetch off the critical path — without it the card
          serialises behind the Promise.all above and the stat cards wait on it.
          It also gives the range filter a loading state on every click. */}
      <Suspense fallback={<DailyTransactionsCardSkeleton />}>
        <DailyTransactionsCard range={range} />
      </Suspense>

      <Card className="gap-0">
        <CardHeader className="border-b pb-4">
          <CardTitle>Recent orders</CardTitle>
          <CardAction>
            <Link
              href="/orders"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              View all orders
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="px-0">
          {recent === null ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Couldn&apos;t load recent orders.
            </p>
          ) : (
            <RecentTransactionsTable orders={recent} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {admin?.email ?? "unknown"}
            </span>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
