import { adminFetch } from "./client";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type ShippingAddress = {
  line1: string;
  city: string;
  postalCode?: string;
  country: string;
};

export type OrderDetail = {
  id: string;
  status: OrderStatus;
  customerEmail: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  currency: "NGN" | "USD";
  subtotal: number;
  logisticsFee: number;
  dutyTax: number;
  totalDue: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
};

type ListOrdersResponse = {
  total: number;
  orders: OrderDetail[];
};

export async function listOrders(params?: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<OrderDetail[]> {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const qs = query.toString() ? `?${query.toString()}` : "";
  const { orders } = await adminFetch<ListOrdersResponse>(`/admin/orders${qs}`);
  return orders;
}

export async function getOrder(id: string): Promise<OrderDetail> {
  return adminFetch<OrderDetail>(`/admin/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<OrderDetail> {
  return adminFetch<OrderDetail>(`/admin/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
