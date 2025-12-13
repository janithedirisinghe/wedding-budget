import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await verifyAuthToken(token);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/budget/:path*", "/checklist/:path*", "/timeline/:path*", "/profile/:path*"],
};
