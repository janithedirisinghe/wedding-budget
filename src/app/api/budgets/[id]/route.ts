import { NextRequest, NextResponse } from "next/server";
import { getBudgetById, softDeleteBudget } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const budget = await getBudgetById(userId, id);
    if (!budget) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(budget);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const deleted = await softDeleteBudget(userId, id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Budget deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
