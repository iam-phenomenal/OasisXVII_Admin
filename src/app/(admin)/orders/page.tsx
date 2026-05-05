import Link from "next/link";

import { listOrders, type OrderStatus } from "@/lib/api/orders";
import { cn } from "@/lib/utils";

import { OrdersTable } from "./_components/OrdersTable";

const FILTER_TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const VALID_STATUSES = new Set<string>([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
]);

type OrdersPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { status } = await searchParams;
  const activeStatus = VALID_STATUSES.has(status ?? "")
    ? (status as OrderStatus)
    : undefined;

  const orders = await listOrders(activeStatus ? { status: activeStatus } : undefined);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Fulfillment
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Orders
        </h1>
      </div>

      <div className="flex flex-wrap gap-1">
        {FILTER_TABS.map(({ value, label }) => {
          const isActive =
            value === "all" ? !activeStatus : value === activeStatus;
          const href =
            value === "all" ? "/orders" : `/orders?status=${value}`;

          return (
            <Link
              key={value}
              href={href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                isActive
                  ? "bg-wine-glow/10 text-on-surface ring-1 ring-inset ring-wine-glow/20"
                  : "text-muted-foreground hover:bg-surface-low hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <OrdersTable orders={orders} />
    </section>
  );
}
