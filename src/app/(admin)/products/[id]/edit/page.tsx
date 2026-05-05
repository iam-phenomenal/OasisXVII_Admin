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

  if (!product || product.status === "archived") {
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
          badge: product.badge,
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
        onSubmit={(data) => updateProduct(product.id, data)}
      />
    </section>
  );
}
