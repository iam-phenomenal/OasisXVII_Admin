import { auth } from "@/auth";
import { db } from "@/db/client";
import { products, settings } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth();
  const [activeCount, soldOutCount, imageCountRow, settingsRow] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.status, "active")),
      db
        .select({ count: count() })
        .from(products)
        .where(eq(products.badge, "Sold Out")),
      db
        .select({
          total: sql<number>`coalesce(sum(jsonb_array_length(${products.images})), 0)`,
        })
        .from(products),
      db.query.settings.findFirst({
        where: eq(settings.id, "global"),
      }),
    ]);

  const activeProducts = activeCount[0]?.count ?? 0;
  const soldOut = soldOutCount[0]?.count ?? 0;
  const totalImages = imageCountRow[0]?.total ?? 0;
  const enabledPayments = (settingsRow?.paymentMethods ?? []).filter(
    (method) => method.enabled,
  ).length;
  const stats = [
    { label: "Active products", icon: "category", value: activeProducts },
    { label: "Sold out", icon: "sell", value: soldOut },
    { label: "Images uploaded", icon: "photo_library", value: totalImages },
    { label: "Payment methods", icon: "point_of_sale", value: enabledPayments },
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
            {session?.user?.email ?? "unknown"}
          </span>
        </p>
      </div>
    </section>
  );
}
