import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/api/products";

import { ProductTable } from "./_components/ProductTable";

export default async function ProductsPage() {
  const allProducts = await listAdminProducts();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Catalogue
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
        </div>

        <Button asChild>
          <Link href="/products/new">Add Product</Link>
        </Button>
      </div>

      <ProductTable
        products={allProducts.filter(
          (product) => product.status !== "archived",
        )}
      />
    </section>
  );
}
