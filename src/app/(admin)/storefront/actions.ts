"use server";

import { adminFetch, ApiError } from "@/lib/api/client";

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

  try {
    await adminFetch("/admin/settings", {
      method: "PATCH",
      body: JSON.stringify({
        heroImages: parsed.data.heroImages,
        heroHeadline: parsed.data.heroHeadline ?? "",
        heroSubheading: parsed.data.heroSubheading ?? "",
      }),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }

    return { error: "Failed to save storefront settings." };
  }
}
