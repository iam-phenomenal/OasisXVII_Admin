import { Clock, CreditCard, ReceiptText, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { getDashboardStats } from "@/lib/api/dashboard";
import { getCurrentAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/formatPrice";

const STATS_CONFIG: { label: string; Icon: LucideIcon; key: "totalOrders" | "totalRevenue" | "activeProducts" | "pendingOrders" }[] = [
  { label: "Total orders", Icon: ReceiptText, key: "totalOrders" },
  { label: "Total revenue", Icon: CreditCard, key: "totalRevenue" },
  { label: "Active products", Icon: Tag, key: "activeProducts" },
  { label: "Pending orders", Icon: Clock, key: "pendingOrders" },
];

export default async function DashboardPage() {
  const [admin, s] = await Promise.all([getCurrentAdmin(), getDashboardStats()]);

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
          <div
            key={label}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <Icon className="h-[18px] w-[18px] text-wine-glow" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {statValues[key]}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {admin?.email ?? "unknown"}
          </span>
        </p>
      </div>
    </section>
  );
}
