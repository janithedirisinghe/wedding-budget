import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireUserId } from "@/lib/auth";

const updateSchema = z.object({
  fullName: z.string().min(2).optional(),
  partnerName: z.string().min(2).optional(),
  currencyId: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        partnerName: true,
        role: true,
        currency: {
          select: { id: true, code: true, name: true, symbol: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.currencyId) {
      const currencyExists = await prisma.currency.findUnique({ where: { id: parsed.data.currencyId } });
      if (!currencyExists) {
        return NextResponse.json({ message: "Currency not found" }, { status: 404 });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: parsed.data.fullName,
        partnerName: parsed.data.partnerName,
        currencyId: parsed.data.currencyId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        partnerName: true,
        role: true,
        currency: { select: { id: true, code: true, name: true, symbol: true } },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
