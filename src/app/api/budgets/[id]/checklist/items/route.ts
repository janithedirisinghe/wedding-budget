import { NextRequest, NextResponse } from "next/server";
import { addChecklistItem } from "@/data/budgets";
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
    const item = await addChecklistItem(body.categoryId, id, body.name);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
