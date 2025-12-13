import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";
import { syncDefaultsForAllBudgets } from "@/lib/defaults";

const createSchema = z.object({
  name: z.string().min(2),
  allocated: z.number().positive(),
  color: z.string().optional(),
  expenses: z.array(z.string().min(1)).optional(),
});

export async function GET() {
  try {
    await requireAdminSession();
    const categories = await prisma.defaultBudgetCategory.findMany({
      orderBy: { createdAt: "desc" },
      include: { expenses: true },
    });
    return NextResponse.json({ categories });
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

    const category = await prisma.defaultBudgetCategory.create({
      data: {
        name: parsed.data.name,
        allocated: parsed.data.allocated,
        color: parsed.data.color,
        expenses: {
          create: parsed.data.expenses?.map((name) => ({ name })) ?? [],
        },
      },
      include: { expenses: true },
    });

    await syncDefaultsForAllBudgets();

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
