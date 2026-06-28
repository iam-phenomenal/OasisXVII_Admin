import { notFound } from "next/navigation";

import { getAdminProduct, listAdminProducts } from "@/lib/api/products";

import { updateProduct } from "../../actions";
import { ProductForm } from "../../_components/ProductForm";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  const [product, allProducts] = await Promise.all([
    getAdminProduct(id).catch(() => null),
    listAdminProducts("active"),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="max-w-4xl space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Products / Edit
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {product.name}
        </h1>
      </div>

      {product.status === "archived" ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            archive
          </span>
          This product is archived. Change the status to make it visible again.
        </div>
      ) : null}

      <ProductForm
        initialValues={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          price: Number(product.price),
          currency: product.currency,
          category: product.category,
          badge: product.badge ?? null,
          status: product.status,
          sizes: product.sizes,
          colors: product.colors,
          specs: product.specs,
          relatedProductIds: product.relatedProductIds,
          images: product.images,
        }}
        productId={product.id}
        allProducts={allProducts
          .filter((entry) => entry.id !== product.id)
          .map((entry) => ({ id: entry.id, name: entry.name }))}
        onSubmit={updateProduct.bind(null, product.id)}
      />
    </section>
  );
}
