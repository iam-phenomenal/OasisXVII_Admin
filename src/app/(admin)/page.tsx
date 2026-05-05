import { getDashboardStats } from "@/lib/api/dashboard";
import { getCurrentAdmin } from "@/lib/auth";
import { formatPrice } from "@/lib/formatPrice";

export default async function DashboardPage() {
  const admin = await getCurrentAdmin();
  const s = await getDashboardStats();
  const stats = [
    {
      label: "Total orders",
      icon: "receipt_long",
      value: s.totalOrders,
    },
    {
      label: "Total revenue",
      icon: "payments",
      value: formatPrice(s.totalRevenue, "NGN"),
    },
    {
      label: "Active products",
      icon: "category",
      value: s.productsByStatus.active,
    },
    {
      label: "Pending orders",
      icon: "pending_actions",
      value: s.ordersByStatus.pending,
    },
  ];

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
        {stats.map(({ label, icon, value }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {label}
              </p>
              <span
                className="material-symbols-outlined text-[18px] text-wine-glow"
                aria-hidden="true"
              >
                {icon}
              </span>
            </div>
            <p className="text-2xl font-semibold tabular-nums text-foreground">
              {value}
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
