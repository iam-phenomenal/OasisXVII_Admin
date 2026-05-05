"use server";

import { adminFetch, ApiError } from "@/lib/api/client";

import {
  checkoutSettingsSchema,
  type CheckoutSettingsFormValues,
} from "./_lib/checkoutSettingsSchema";

export type CheckoutActionResult = { error: string } | void;

export async function updateCheckoutSettings(
  data: CheckoutSettingsFormValues,
): Promise<CheckoutActionResult> {
  const parsed = checkoutSettingsSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  try {
    await adminFetch("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({
        paymentMethods: parsed.data.paymentMethods.map((m) => ({
          ...m,
          enabled: true,
        })),
        logisticsFeeNgn: parsed.data.logisticsFeeNgn,
        dutyTaxNgn: parsed.data.dutyTaxNgn,
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Failed to save checkout settings." };
  }
}
