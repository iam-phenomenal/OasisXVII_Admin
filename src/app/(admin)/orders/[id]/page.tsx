import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getOrder, type OrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/formatPrice";

import { StatusUpdateForm } from "./_components/StatusUpdateForm";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "confirmed":
      return "border-blue-500/25 bg-blue-500/10 text-blue-300";
    case "shipped":
      return "border-purple-500/25 bg-purple-500/10 text-purple-300";
    case "delivered":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-300";
    case "cancelled":
      return "border-border bg-muted text-muted-foreground";
  }
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(id).catch(() => null);

  if (!order) notFound();

  const { shippingAddress: addr } = order;
  const cityLine = [addr.city, addr.postalCode].filter(Boolean).join(", ");

  const placedDate = new Date(order.createdAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="max-w-4xl space-y-6">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <span
          className="material-symbols-outlined text-[16px]"
          aria-hidden="true"
        >
          arrow_back
        </span>
        Orders
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Fulfillment / Order
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">
              {order.id}
            </h1>
            <Badge
              variant="outline"
              className={getStatusBadgeClass(order.status)}
            >
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Placed {placedDate}</p>
        </div>

        <StatusUpdateForm orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Customer
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {order.customerName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.customerEmail}
            </p>
            <p className="text-sm capitalize text-muted-foreground">
              via {order.paymentMethod}
            </p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Shipping Address
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{addr.line1}</p>
            {cityLine ? <p>{cityLine}</p> : null}
            <p>{addr.country}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Items
          </h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit price</TableHead>
              <TableHead className="text-right">Line total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-foreground">
                  {item.productName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.size}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.color}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatPrice(item.unitPrice, order.currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {formatPrice(item.lineTotal, order.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="ml-auto max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">
              {formatPrice(order.subtotal, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Logistics fee</span>
            <span className="font-medium text-foreground">
              {formatPrice(order.logisticsFee, order.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duty &amp; tax</span>
            <span className="font-medium text-foreground">
              {formatPrice(order.dutyTax, order.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <span className="text-foreground">Total due</span>
            <span className="text-foreground">
              {formatPrice(order.totalDue, order.currency)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
