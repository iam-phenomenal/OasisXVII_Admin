import { adminFetch } from "./client";

export type DashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  productsByStatus: {
    active: number;
    draft: number;
    archived: number;
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  return adminFetch<DashboardStats>("/admin/dashboard/stats");
}
