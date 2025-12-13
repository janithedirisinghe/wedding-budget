import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Signed out" });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
