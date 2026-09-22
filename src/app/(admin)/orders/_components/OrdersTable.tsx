import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderSummary } from "@/lib/api/orders";
import { formatPrice } from "@/lib/formatPrice";

type OrdersTableProps = {
  orders: OrderSummary[];
};

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                No orders found.
              </TableCell>
            </TableRow>
          ) : null}

          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {order.id}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {order.customerName}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {order.itemCount}
              </TableCell>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatPrice(order.totalDue, order.currency)}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {order.paymentMethod}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button variant="outline" size="icon-sm" asChild>
                    <Link
                      href={`/orders/${order.id}`}
                      aria-label={`View order ${order.id}`}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
