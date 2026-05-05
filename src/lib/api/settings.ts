import type { Settings } from "@/types/settings";

import { adminFetch } from "./client";

type AdminSettingsResponse = Partial<Settings>;

export async function getAdminSettings(): Promise<AdminSettingsResponse> {
  return adminFetch<AdminSettingsResponse>("/admin/settings");
}
