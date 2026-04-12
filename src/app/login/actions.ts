"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { loginRateLimit } from "@/lib/rateLimit";

export type LoginActionState = {
  error?: string;
};

function getClientIp(headerValue: string | null): string {
  return headerValue?.split(",")[0]?.trim() || "unknown";
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const requestHeaders = await headers();
  const ip = getClientIp(
    requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip"),
  );

  const { success } = await loginRateLimit.limit(ip);

  if (!success) {
    return { error: "Too many login attempts. Please wait 10 minutes." };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }

    throw error;
  }

  redirect("/");
}
