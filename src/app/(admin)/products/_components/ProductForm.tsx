"use client";

import { useState, useTransition } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  productBadgeOptions,
  productCategoryOptions,
  productCurrencyOptions,
  productSchema,
  productStatusOptions,
  type ProductFormValues,
} from "../_lib/productSchema";
import { ImageUpload } from "./ImageUpload";
import { TagInput } from "./TagInput";
import type { ProductActionResult } from "../actions";

type ProductFormProps = {
  initialValues?: Partial<ProductFormValues>;
  productId?: string;
  allProducts: Array<Pick<ProductFormValues, "id" | "name">>;
  onSubmit: (data: ProductFormValues) => Promise<ProductActionResult>;
};

const productFormDraftSchema = productSchema.omit({ specs: true }).extend({
  specsRows: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .default([]),
});

type ProductFormDraftInput = z.input<typeof productFormDraftSchema>;
type ProductFormDraft = z.output<typeof productFormDraftSchema>;
type ClientFieldName = keyof ProductFormDraftInput;

const clientFieldNames = new Set<ClientFieldName>([
  "id",
  "slug",
  "name",
  "tagline",
  "description",
  "price",
  "currency",
  "category",
  "badge",
  "status",
  "sizes",
  "colors",
  "relatedProductIds",
  "images",
]);

const defaultValues: ProductFormDraft = {
  id: "",
  slug: "",
  name: "",
  tagline: "",
  description: "",
  price: 0,
  currency: "NGN",
  category: "tops",
  badge: null,
  status: "draft",
  sizes: [],
  colors: [],
  relatedProductIds: [],
  images: [],
  specsRows: [],
};

function specsToRows(specs?: Record<string, string>) {
  if (!specs || Object.keys(specs).length === 0) {
    return [];
  }

  return Object.entries(specs).map(([key, value]) => ({ key, value }));
}

function rowsToSpecs(rows: Array<{ key: string; value: string }>) {
  return rows.reduce<Record<string, string>>((accumulator, row) => {
    const key = row.key.trim();
    const value = row.value.trim();

    if (!key || !value) {
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
}

function buildInitialValues(
  initialValues?: Partial<ProductFormValues>,
): ProductFormDraft {
  return {
    ...defaultValues,
    ...initialValues,
    price: initialValues?.price ?? 0,
    sizes: initialValues?.sizes ?? [],
    colors: initialValues?.colors ?? [],
    relatedProductIds: initialValues?.relatedProductIds ?? [],
    images: initialValues?.images ?? [],
    specsRows: specsToRows(initialValues?.specs),
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

export function ProductForm({
  initialValues,
  productId,
  allProducts,
  onSubmit,
}: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ProductFormDraftInput, unknown, ProductFormDraft>({
    resolver: zodResolver(productFormDraftSchema),
    defaultValues: buildInitialValues(initialValues),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "specsRows",
  });

  const relatedProductIds = form.watch("relatedProductIds") ?? [];

  const selectedRelatedProducts = allProducts.filter((product) =>
    relatedProductIds.includes(product.id),
  );

  const handleSubmit = form.handleSubmit((values) => {
    setFormError(null);

    const payload: ProductFormValues = {
      id: values.id,
      slug: values.slug,
      name: values.name,
      tagline: values.tagline,
      description: values.description,
      price: values.price,
      currency: values.currency,
      category: values.category,
      badge: values.badge,
      status: values.status,
      sizes: values.sizes,
      colors: values.colors,
      relatedProductIds: values.relatedProductIds,
      images: values.images,
      specs: rowsToSpecs(values.specsRows),
    };

    startTransition(async () => {
      const result = await onSubmit(payload);

      if (!result) {
        return;
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          if (!message) {
            continue;
          }

          if (!clientFieldNames.has(field as ClientFieldName)) {
            setFormError(message);
            continue;
          }

          form.setError(field as ClientFieldName, {
            type: "server",
            message,
          });
        }
      }

      if (result.error) {
        setFormError(result.error);
      }
    });
  });

  const isEditMode = Boolean(productId);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-border bg-card p-6"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Core details
            </h2>
            <p className="text-sm text-muted-foreground">
              Set the product identity and core copy.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" disabled={isEditMode} {...form.register("id")} />
              <FieldError message={form.formState.errors.id?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                onChange={(event) => {
                  const nextName = event.target.value;
                  form.setValue("name", nextName, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue(
                    "slug",
                    nextName
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                    { shouldDirty: true, shouldValidate: true },
                  );
                }}
              />
              <FieldError message={form.formState.errors.name?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" {...form.register("slug")} />
              <FieldError message={form.formState.errors.slug?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" {...form.register("tagline")} />
              <FieldError message={form.formState.errors.tagline?.message} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={6}
              {...form.register("description")}
            />
            <FieldError message={form.formState.errors.description?.message} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Pricing & classification
            </h2>
            <p className="text-sm text-muted-foreground">
              Control pricing, merchandising, and publish state.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...form.register("price", { valueAsNumber: true })}
              />
              <FieldError message={form.formState.errors.price?.message} />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Controller
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCurrencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.currency?.message} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full capitalize">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategoryOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="capitalize">{option}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.category?.message} />
            </div>

            <div className="space-y-2">
              <Label>Badge</Label>
              <Controller
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {productBadgeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.badge?.message} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full capitalize">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {productStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="capitalize">{option}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldError message={form.formState.errors.status?.message} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Variants
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage sizes, colors, specs, and related products.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Sizes</Label>
              <Controller
                control={form.control}
                name="sizes"
                render={({ field }) => (
                  <TagInput
                    label="Sizes"
                    placeholder="Add a size"
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError
                message={
                  form.formState.errors.sizes?.message as string | undefined
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Colors</Label>
              <Controller
                control={form.control}
                name="colors"
                render={({ field }) => (
                  <TagInput
                    label="Colors"
                    placeholder="Add a color"
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
              <FieldError
                message={
                  form.formState.errors.colors?.message as string | undefined
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Specs</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ key: "", value: "" })}
              >
                Add row
              </Button>
            </div>

            <div className="space-y-3">
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No specs added yet.
                </p>
              ) : null}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                >
                  <Input
                    placeholder="Key"
                    {...form.register(`specsRows.${index}.key`)}
                  />
                  <Input
                    placeholder="Value"
                    {...form.register(`specsRows.${index}.value`)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Related products</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>
                    {selectedRelatedProducts.length > 0
                      ? `${selectedRelatedProducts.length} selected`
                      : "Select related products"}
                  </span>
                  <span
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuLabel>Active products</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allProducts.length === 0 ? (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    No products available.
                  </div>
                ) : (
                  allProducts.map((product) => {
                    const checked = relatedProductIds.includes(product.id);

                    return (
                      <DropdownMenuCheckboxItem
                        key={product.id}
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          const nextValues =
                            form.getValues("relatedProductIds") ?? [];

                          if (nextChecked) {
                            form.setValue(
                              "relatedProductIds",
                              [...nextValues, product.id],
                              {
                                shouldDirty: true,
                                shouldValidate: true,
                              },
                            );
                            return;
                          }

                          form.setValue(
                            "relatedProductIds",
                            nextValues.filter((value) => value !== product.id),
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }}
                      >
                        {product.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {selectedRelatedProducts.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedRelatedProducts.map((product) => (
                  <Badge
                    key={product.id}
                    variant="outline"
                    className="gap-1 rounded-full px-3 py-1"
                  >
                    <span>{product.name}</span>
                    <button
                      type="button"
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Remove ${product.name}`}
                      onClick={() =>
                        form.setValue(
                          "relatedProductIds",
                          relatedProductIds.filter(
                            (value) => value !== product.id,
                          ),
                          { shouldDirty: true, shouldValidate: true },
                        )
                      }
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Images</h2>
            <p className="text-sm text-muted-foreground">
              Upload, reorder, and curate the product gallery.
            </p>
          </div>

          <Controller
            control={form.control}
            name="images"
            render={({ field }) => (
              <ImageUpload
                value={field.value ?? []}
                onChange={(nextImages) => field.onChange(nextImages)}
                persistedUrls={initialValues?.images ?? []}
              />
            )}
          />
          <FieldError
            message={
              form.formState.errors.images?.message as string | undefined
            }
          />
        </div>
      </div>

      {formError ? (
        <p className="text-sm text-destructive">{formError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? isEditMode
              ? "Saving..."
              : "Creating..."
            : isEditMode
              ? "Save changes"
              : "Create product"}
        </Button>
      </div>
    </form>
  );
}
