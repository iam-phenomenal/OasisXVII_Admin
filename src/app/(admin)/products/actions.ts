"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/db/client";
import { products } from "@/db/schema";

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
  const session = await auth();

  if (!session) {
    return { error: "Unauthorized." } satisfies Exclude<
      ProductActionResult,
      void
    >;
  }

  return null;
}

function normalizePayload(data: ProductFormValues, id?: string) {
  return {
    slug: data.slug,
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    price: String(data.price),
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
    updatedAt: new Date(),
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

  const existingProduct = await db.query.products.findFirst({
    where: eq(products.slug, parsed.data.slug),
  });

  if (existingProduct) {
    return { fieldErrors: { slug: "Slug already in use." } };
  }

  await db.insert(products).values({
    id: parsed.data.id,
    ...normalizePayload(parsed.data),
  });

  revalidatePath("/products");
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

  const existingProduct = await db.query.products.findFirst({
    where: and(eq(products.slug, parsed.data.slug), ne(products.id, id)),
  });

  if (existingProduct) {
    return { fieldErrors: { slug: "Slug already in use." } };
  }

  await db
    .update(products)
    .set(normalizePayload(parsed.data, id))
    .where(eq(products.id, id));

  revalidatePath("/products");
  redirect("/products");
}

export async function archiveProduct(id: string): Promise<void> {
  await db
    .update(products)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(products.id, id));

  revalidatePath("/products");
}
