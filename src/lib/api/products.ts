import { adminFetch } from "./client";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  currency: "NGN" | "USD";
  images: string[];
  badge?: "New Drop" | "Best Seller" | "Sold Out";
  sizes: string[];
  colors: string[];
  description: string;
  specs: Record<string, string>;
  category: "tops" | "bottoms" | "accessories" | "footwear";
  relatedProductIds: string[];
  status: "active" | "draft" | "archived";
  createdAt?: string;
  updatedAt?: string;
};

export async function listAdminProducts(
  status?: AdminProduct["status"],
): Promise<AdminProduct[]> {
  const query = status ? `?status=${status}` : "";
  return adminFetch<AdminProduct[]>(`/admin/products${query}`);
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/admin/products/${id}`);
}
