import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { softDeleteExpense } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  projected: z.number().nonnegative().optional(),
  date: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string; expenseId: string }> | { id: string; expenseId: string } };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, expenseId } = await context.params;
    const userId = await requireUserId();
    const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
    if (!budget) {
      return NextResponse.json({ message: "Budget not found" }, { status: 404 });
    }

    const existingExpense = await prisma.expense.findFirst({ where: { id: expenseId, budgetId: id, deleted: false } });
    if (!existingExpense) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data: Prisma.ExpenseUpdateInput = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.date) data.date = new Date(parsed.data.date);
    if (parsed.data.projected !== undefined) data.projected = parsed.data.projected;
    let amountDelta = 0;
    if (parsed.data.amount !== undefined) {
      data.amount = parsed.data.amount;
      amountDelta = parsed.data.amount - Number(existingExpense.amount);
    }

    const updatedExpense = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.update({ where: { id: expenseId }, data });
      if (amountDelta !== 0) {
        await tx.category.update({
          where: { id: existingExpense.categoryId },
          data: { spent: { increment: amountDelta } },
        });
      }
      return expense;
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id, expenseId } = await context.params;
    const userId = await requireUserId();
    const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
    if (!budget) return NextResponse.json({ message: "Budget not found" }, { status: 404 });

    const deleted = await softDeleteExpense(id, expenseId);
    if (!deleted) return NextResponse.json({ message: "Expense not found" }, { status: 404 });

    return NextResponse.json({ message: "Expense deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
