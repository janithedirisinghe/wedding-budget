import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { softDeleteChecklistItem, toggleChecklistItem } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string; itemId: string }> | { id: string; itemId: string };
};

export async function PATCH(_: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id, itemId } = await context.params;

    const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
    if (!budget) return NextResponse.json({ message: "Budget not found" }, { status: 404 });

    const item = await toggleChecklistItem(itemId);
    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const userId = await requireUserId();
    const { id, itemId } = await context.params;

    const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
    if (!budget) return NextResponse.json({ message: "Budget not found" }, { status: 404 });

    const deleted = await softDeleteChecklistItem(id, itemId);
    if (!deleted) return NextResponse.json({ message: "Item not found" }, { status: 404 });
    return NextResponse.json({ message: "Checklist item deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
