import { NextRequest, NextResponse } from "next/server";
import { addChecklistCategory } from "@/data/budgets";
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
    const category = await addChecklistCategory(id, body.name);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
