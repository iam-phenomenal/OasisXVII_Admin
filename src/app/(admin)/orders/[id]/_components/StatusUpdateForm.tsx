"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/lib/api/orders";

import { updateOrderStatusAction } from "../../actions";

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

type StatusUpdateFormProps = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function StatusUpdateForm({
  orderId,
  currentStatus,
}: StatusUpdateFormProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const isDirty = status !== currentStatus;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty) return;

    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, status);
      if (result?.error) {
        toast.error(result.error);
        setStatus(currentStatus);
      } else {
        toast.success("Order status updated.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(v) => setStatus(v as OrderStatus)}
        disabled={isPending}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}
