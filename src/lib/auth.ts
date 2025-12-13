import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { AUTH_COOKIE_NAME, signAuthToken, verifyAuthToken } from "@/lib/auth-token";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export async function attachAuthCookie(response: NextResponse, userId: string, role: UserRole) {
  const token = await signAuthToken(userId, role);
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    maxAge: SESSION_MAX_AGE,
    ...baseCookieOptions,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    maxAge: 0,
    ...baseCookieOptions,
  });
}

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAuthToken(token);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
