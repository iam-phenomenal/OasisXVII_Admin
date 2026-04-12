"use client";

import { startTransition, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { archiveProduct } from "@/app/(admin)/products/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Product } from "@/db/schema";
import { formatPrice } from "@/lib/formatPrice";

type ProductTableProps = {
  products: Product[];
};

function getStatusClassName(status: Product["status"]) {
  if (status === "active") {
    return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
  }

  return "border-border bg-muted text-muted-foreground";
}

export function ProductTable({ products }: ProductTableProps) {
  const router = useRouter();
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null);

  const handleArchive = (id: string) => {
    setPendingArchiveId(id);

    startTransition(async () => {
      try {
        await archiveProduct(id);
        router.refresh();
        setActiveArchiveId(null);
      } finally {
        setPendingArchiveId(null);
      }
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thumbnail</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Images</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                No products yet.
              </TableCell>
            </TableRow>
          ) : null}

          {products.map((product) => {
            const isArchiving = pendingArchiveId === product.id;

            return (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div
                      className="h-8 w-8 rounded-lg bg-muted"
                      aria-hidden="true"
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {product.name}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {product.category}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatPrice(Number(product.price), product.currency)}
                </TableCell>
                <TableCell>
                  {product.badge ? (
                    <Badge variant="outline">{product.badge}</Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusClassName(product.status)}
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.images.length}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon-sm" asChild>
                      <Link
                        href={`/products/${product.id}/edit`}
                        aria-label={`Edit ${product.name}`}
                      >
                        <span
                          className="material-symbols-outlined text-[18px]"
                          aria-hidden="true"
                        >
                          edit_square
                        </span>
                      </Link>
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      aria-label={`Archive ${product.name}`}
                      disabled={Boolean(pendingArchiveId)}
                      onClick={() => setActiveArchiveId(product.id)}
                    >
                      <span
                        className="material-symbols-outlined text-[18px]"
                        aria-hidden="true"
                      >
                        archive
                      </span>
                    </Button>

                    <AlertDialog
                      open={activeArchiveId === product.id}
                      onOpenChange={(open) =>
                        setActiveArchiveId(open ? product.id : null)
                      }
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will archive the product. It will no longer
                            appear on the storefront.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isArchiving}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={isArchiving}
                            onClick={() => handleArchive(product.id)}
                          >
                            {isArchiving ? "Archiving..." : "Archive"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
