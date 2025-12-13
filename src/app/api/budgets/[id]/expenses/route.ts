import { NextRequest, NextResponse } from "next/server";
import { addExpense } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await requireUserId();
    const { id } = await context.params;
    const body = await request.json();
    const expense = await addExpense(id, {
      categoryId: body.categoryId,
      name: body.name,
      amount: Number(body.amount),
      projected: body.projected ? Number(body.projected) : undefined,
      date: body.date ? new Date(body.date) : undefined,
      note: body.note,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
