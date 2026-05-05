"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/client";
import { updateOrderStatus, type OrderStatus } from "@/lib/api/orders";

export type OrderStatusActionResult = { error: string } | void;

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<OrderStatusActionResult> {
  try {
    await updateOrderStatus(id, status);
    revalidatePath("/orders");
    revalidatePath(`/orders/${id}`);
  } catch (error) {
    if (error instanceof ApiError) {
      return { error: error.message };
    }
    return { error: "Failed to update order status." };
  }
}
