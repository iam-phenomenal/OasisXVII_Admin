"use server";

import { redirect } from "next/navigation";

import { setAdminToken } from "@/lib/auth";

const DASHBOARD = "/";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return { error: "API_URL is not configured." };
  }

  const email = (formData.get("email") as string | null)?.trim();
  const password = (formData.get("password") as string | null) ?? "";

  const response = await fetch(`${apiUrl}/admin/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));

    if (response.status === 429) {
      return { error: "Too many attempts. Please wait." };
    }

    return {
      error:
        typeof body.error === "string" ? body.error : "Invalid credentials",
    };
  }

  const { token, expiresAt } = (await response.json()) as {
    token: string;
    expiresAt: string;
  };


  await setAdminToken(token, expiresAt);

  redirect(DASHBOARD);
}
