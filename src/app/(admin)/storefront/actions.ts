"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

import {
  storefrontSchema,
  type StorefrontFormValues,
} from "./_lib/storefrontSchema";

export type StorefrontActionResult = { error: string } | void;

export async function updateStorefrontSettings(
  data: StorefrontFormValues,
): Promise<StorefrontActionResult> {
  const parsed = storefrontSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data." };
  }

  const heroImages = parsed.data.heroImages;
  const heroHeadline = parsed.data.heroHeadline || null;
  const heroSubheading = parsed.data.heroSubheading || null;
  const existing = await db.query.settings.findFirst({
    where: eq(settings.id, "global"),
  });

  if (!existing) {
    await db.insert(settings).values({
      id: "global",
      heroImages,
      heroHeadline,
      heroSubheading,
      paymentMethods: [],
      logisticsFeeNgn: "0",
      dutyTaxNgn: "0",
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(settings)
      .set({
        heroImages,
        heroHeadline,
        heroSubheading,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, "global"));
  }

  revalidatePath("/");
  revalidatePath("/storefront");
}
