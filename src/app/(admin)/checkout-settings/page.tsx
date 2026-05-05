import { getAdminSettings } from "@/lib/api/settings";

import { CheckoutSettingsForm } from "./_components/CheckoutSettingsForm";
import {
  DEFAULT_DUTY_TAX,
  DEFAULT_LOGISTICS_FEE,
  DEFAULT_PAYMENT_METHODS,
} from "./_lib/defaults";

export default async function CheckoutSettingsPage() {
  const settings = await getAdminSettings();

  const initialValues = {
    paymentMethods:
      settings.paymentMethods?.length === 1
        ? settings.paymentMethods
        : DEFAULT_PAYMENT_METHODS,
    logisticsFeeNgn: settings.logisticsFeeNgn ?? DEFAULT_LOGISTICS_FEE,
    dutyTaxNgn: settings.dutyTaxNgn ?? DEFAULT_DUTY_TAX,
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
