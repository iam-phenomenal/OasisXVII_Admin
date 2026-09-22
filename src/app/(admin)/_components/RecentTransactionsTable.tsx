import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
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

type RecentTransactionsTableProps = {
  orders: OrderSummary[];
};

export function RecentTransactionsTable({
  orders,
}: RecentTransactionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="px-4 py-10 text-center text-muted-foreground"
            >
              No transactions yet.
            </TableCell>
          </TableRow>
        ) : null}

        {orders.map((order) => (
          <TableRow key={order.id} className="relative">
            <TableCell className="font-medium text-foreground">
              <Link
                href={`/orders/${order.id}`}
                className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                {order.customerName}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground tabular-nums">
              {formatPrice(order.totalDue, order.currency)}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
