import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleApiError, validationError } from "@/lib/http";
import { syncDefaultsForAllBudgets } from "@/lib/defaults";

const createExpenseSchema = z.object({
  name: z.string().min(1),
});

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const category = await prisma.defaultBudgetCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const expense = await prisma.defaultBudgetExpense.create({
      data: {
        defaultCategoryId: id,
        name: parsed.data.name,
      },
    });

    await syncDefaultsForAllBudgets();

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
