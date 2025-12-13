import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";
import { softDeleteChecklistCategory } from "@/data/budgets";

type RouteContext = { params: Promise<{ id: string; categoryId: string }> | { id: string; categoryId: string } };

export async function DELETE(_: Request, context: RouteContext) {
   try {
     const userId = await requireUserId();
     const { id, categoryId } = await context.params;

     const budget = await prisma.budget.findFirst({ where: { id, userId, deleted: false }, select: { id: true } });
     if (!budget) return NextResponse.json({ message: "Budget not found" }, { status: 404 });

     const deleted = await softDeleteChecklistCategory(id, categoryId);
     if (!deleted) return NextResponse.json({ message: "Category not found" }, { status: 404 });

     return NextResponse.json({ message: "Checklist category deleted" });
   } catch (error) {
     return handleApiError(error);
   }
 }
