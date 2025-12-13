import { NextRequest, NextResponse } from "next/server";
import { addChecklistCategory } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
    if (!budget) return NextResponse.json({ message: "Budget not found" }, { status: 404 });
    const body = await request.json();
    const category = await addChecklistCategory(id, body.name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
