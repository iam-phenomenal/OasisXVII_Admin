import Link from "next/link";

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
import type { OrderDetail, OrderStatus } from "@/lib/api/orders";
import { formatPrice } from "@/lib/formatPrice";

type OrdersTableProps = {
  orders: OrderDetail[];
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
              <TableCell className="text-muted-foreground">
                {order.items.length}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatPrice(order.totalDue, order.currency)}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {order.paymentMethod}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(order.status)}
                >
                  {order.status}
                </Badge>
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
                      <span
                        className="material-symbols-outlined text-[18px]"
                        aria-hidden="true"
                      >
                        open_in_new
                      </span>
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
