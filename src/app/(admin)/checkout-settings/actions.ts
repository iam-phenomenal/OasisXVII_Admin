"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

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

  const { paymentMethods, logisticsFeeNgn, dutyTaxNgn } = parsed.data;

  const existing = await db.query.settings.findFirst({
    where: eq(settings.id, "global"),
  });

  if (!existing) {
    await db.insert(settings).values({
      id: "global",
      paymentMethods,
      logisticsFeeNgn: String(logisticsFeeNgn),
      dutyTaxNgn: String(dutyTaxNgn),
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(settings)
      .set({
        paymentMethods,
        logisticsFeeNgn: String(logisticsFeeNgn),
        dutyTaxNgn: String(dutyTaxNgn),
        updatedAt: new Date(),
      })
      .where(eq(settings.id, "global"));
  }

  revalidatePath("/checkout-settings");
}
