import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/http";

export async function GET() {
  try {
    const currencies = await prisma.currency.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, symbol: true },
    });
    return NextResponse.json({ currencies });
  } catch (error) {
    return handleApiError(error);
  }
}
