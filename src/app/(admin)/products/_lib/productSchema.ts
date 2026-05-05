import { z } from "zod";

export const productCurrencyOptions = ["NGN", "USD"] as const;
export const productCategoryOptions = [
  "tops",
  "bottoms",
  "accessories",
  "footwear",
] as const;
export const productBadgeOptions = [
  "New Drop",
  "Best Seller",
  "Sold Out",
] as const;
export const productStatusOptions = ["active", "draft", "archived"] as const;

export const productSchema = z.object({
  id: z.string().min(1, "ID is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
  name: z.string().min(1, "Name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  currency: z.enum(productCurrencyOptions),
  category: z.enum(productCategoryOptions),
  badge: z.enum(productBadgeOptions).nullable(),
  status: z.enum(productStatusOptions),
  sizes: z.array(z.string().min(1)).default([]),
  colors: z.array(z.string().min(1)).default([]),
  specs: z.record(z.string(), z.string()).default({}),
  relatedProductIds: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;
