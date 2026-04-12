import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

import { CheckoutSettingsForm } from "./_components/CheckoutSettingsForm";
import {
  DEFAULT_DUTY_TAX,
  DEFAULT_LOGISTICS_FEE,
  DEFAULT_PAYMENT_METHODS,
} from "./_lib/defaults";

export default async function CheckoutSettingsPage() {
  const row = await db.query.settings.findFirst({
    where: eq(settings.id, "global"),
  });

  const initialValues = {
    paymentMethods:
      row?.paymentMethods?.length === 3
        ? row.paymentMethods
        : DEFAULT_PAYMENT_METHODS,
    logisticsFeeNgn: row ? Number(row.logisticsFeeNgn) : DEFAULT_LOGISTICS_FEE,
    dutyTaxNgn: row ? Number(row.dutyTaxNgn) : DEFAULT_DUTY_TAX,
  };

  return (
    <section className="max-w-3xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Checkout Settings
        </h1>
      </div>

      <CheckoutSettingsForm initialValues={initialValues} />
    </section>
  );
}
