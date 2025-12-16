import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminSection = pathname.startsWith("/admin");
  const isAdminAuthRoute = pathname.startsWith("/admin/login") || pathname.startsWith("/admin/register");

  if (isAdminAuthRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const loginPath = isAdminSection ? "/admin/login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  try {
    const payload = await verifyAuthToken(token);
    if (isAdminSection && payload.role !== "ADMIN") {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
    return NextResponse.next();
  } catch {
    const loginPath = isAdminSection ? "/admin/login" : "/login";
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/budget/:path*",
    "/checklist/:path*",
    "/timeline/:path*",
    "/profile/:path*",
    "/admin/:path*",
  ],
};
