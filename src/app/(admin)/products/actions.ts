"use server";

import { redirect } from "next/navigation";

import { ApiError, adminFetch } from "@/lib/api/client";
import { getCurrentAdmin } from "@/lib/auth";

import { productSchema, type ProductFormValues } from "./_lib/productSchema";

type FieldErrors = Partial<Record<keyof ProductFormValues, string>>;

export type ProductActionResult = {
  error?: string;
  fieldErrors?: FieldErrors;
} | void;

function buildFieldErrors(data: ProductFormValues): FieldErrors {
  const parsed = productSchema.safeParse(data);

  if (parsed.success) {
    return {};
  }

  const flattened = parsed.error.flatten().fieldErrors;

  return Object.fromEntries(
    Object.entries(flattened)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([key, messages]) => [key, messages?.[0] ?? "Invalid value"]),
  ) as FieldErrors;
}

async function ensureAuthorized() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return { error: "Unauthorized." } satisfies Exclude<
      ProductActionResult,
      void
    >;
  }

  return null;
}

function normalizePayload(data: ProductFormValues, id?: string) {
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    price: data.price,
    currency: data.currency,
    category: data.category,
    badge: data.badge,
    status: data.status,
    sizes: data.sizes,
    colors: data.colors,
    specs: data.specs,
    relatedProductIds: data.relatedProductIds.filter(
      (relatedId) => relatedId !== id,
    ),
    images: data.images,
  };
}

export async function createProduct(
  data: ProductFormValues,
): Promise<ProductActionResult> {
  const unauthorized = await ensureAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: buildFieldErrors(data) };
  }

  try {
    await adminFetch("/admin/products", {
      method: "POST",
      body: JSON.stringify(normalizePayload(parsed.data)),
    });
  } catch (error: any) {
    if (error instanceof ApiError && error.status === 409) {
      return { fieldErrors: { slug: "Slug already in use." } };
    }

    return { error: error.message || "Failed to create product." };
  }

  redirect("/products");
}

export async function updateProduct(
  id: string,
  data: ProductFormValues,
): Promise<ProductActionResult> {
  const unauthorized = await ensureAuthorized();

  if (unauthorized) {
    return unauthorized;
  }

  const parsed = productSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: buildFieldErrors(data) };
  }

  try {
    await adminFetch(`/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(normalizePayload(parsed.data, id)),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { fieldErrors: { slug: "Slug already in use." } };
    }

    return { error: "Failed to update product." };
  }

  redirect("/products");
}

export async function archiveProduct(id: string): Promise<void> {
  const unauthorized = await ensureAuthorized();

  if (unauthorized) {
    redirect("/login");
  }

  await adminFetch(`/admin/products/${id}`, { method: "DELETE" });
}
