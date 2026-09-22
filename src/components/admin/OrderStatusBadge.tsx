import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/api/orders";

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  confirmed: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  shipped: "border-purple-500/25 bg-purple-500/10 text-purple-300",
  delivered: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-border bg-muted text-muted-foreground",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {status}
    </Badge>
  );
}
