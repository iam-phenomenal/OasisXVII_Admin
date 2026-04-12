import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { products } from "@/db/schema";

import { createProduct } from "../actions";
import { ProductForm } from "../_components/ProductForm";

export default async function NewProductPage() {
  const allProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.status, "active"));

  return (
    <section className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Products / New
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Add Product
        </h1>
      </div>

      <ProductForm allProducts={allProducts} onSubmit={createProduct} />
    </section>
  );
}
