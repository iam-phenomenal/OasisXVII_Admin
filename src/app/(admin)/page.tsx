import { Clock, CreditCard, ReceiptText, Tag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent } from "@/components/ui/card";
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
          <StatCard
            key={label}
            label={label}
            Icon={Icon}
            value={statValues[key]}
          />
        ))}
      </div>

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
