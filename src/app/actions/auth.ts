"use server";

import { redirect } from "next/navigation";

import { adminFetch } from "@/lib/api/client";
import { clearAdminToken } from "@/lib/auth";

export async function logoutAction() {
  await adminFetch("/admin/auth/logout", { method: "POST" }).catch(() => {});
  await clearAdminToken();
  redirect("/login");
}
