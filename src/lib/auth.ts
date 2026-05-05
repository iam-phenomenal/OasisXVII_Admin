import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";

export interface AdminTokenPayload extends JWTPayload {
  sub: string;
  email: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

function isAdminTokenPayload(
  payload: JWTPayload,
): payload is AdminTokenPayload {
  return typeof payload.sub === "string" && typeof payload.email === "string";
}

export async function getAdminToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function setAdminToken(
  token: string,
  expiresAt: string,
): Promise<void> {
  const store = await cookies();

  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
    path: "/",
  });
}

export async function clearAdminToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function verifyAdminToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (!isAdminTokenPayload(payload)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const token = await getAdminToken();

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}
