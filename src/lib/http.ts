import { NextResponse } from "next/server";
import { UnauthorizedError } from "@/lib/auth";

export function handleApiError(error: unknown) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  console.error(error);
  return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
}

export function validationError(details: unknown) {
  return NextResponse.json({ message: "Validation failed", details }, { status: 400 });
}
