import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { hashPassword, requireAdminSession } from "@/lib/auth";
import { generateUniqueUsername } from "@/lib/username";

const adminUserInclude = {
  budgets: {
    include: {
      categories: true,
      expenses: true,
      checklist: {
        include: {
          items: true,
        },
      },
      timeline: true,
    },
  },
  currency: {
    select: { id: true, code: true, name: true, symbol: true },
  },
};

const createUserSchema = z.object({
  fullName: z.string().min(2),
  partnerName: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN"]).optional(),
  currencyId: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdminSession();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: adminUserInclude,
    });
    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const username = await generateUniqueUsername(parsed.data.fullName);
    const passwordHash = await hashPassword(parsed.data.password);

    if (parsed.data.currencyId) {
      const currencyExists = await prisma.currency.findUnique({ where: { id: parsed.data.currencyId } });
      if (!currencyExists) {
        return NextResponse.json({ message: "Currency not found" }, { status: 404 });
      }
    }

    const user = await prisma.user.create({
      data: {
        username,
        email: parsed.data.email,
        fullName: parsed.data.fullName,
        partnerName: parsed.data.partnerName,
        passwordHash,
        role: parsed.data.role ?? "USER",
        currencyId: parsed.data.currencyId,
      },
      include: adminUserInclude,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
