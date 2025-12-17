import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";

const createSchema = z.object({
  code: z.string().min(3).max(10),
  name: z.string().min(2),
  symbol: z.string().max(5).optional().nullable(),
});

export async function GET() {
  try {
    await requireAdminSession();
    const currencies = await prisma.currency.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true, symbol: true },
    });
    return NextResponse.json({ currencies });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const currency = await prisma.currency.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        name: parsed.data.name,
        symbol: parsed.data.symbol ?? null,
      },
      select: { id: true, code: true, name: true, symbol: true },
    });

    return NextResponse.json({ currency }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
