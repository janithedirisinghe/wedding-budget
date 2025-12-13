import { NextRequest, NextResponse } from "next/server";
import { addCategory } from "@/data/budgets";
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
    const category = await addCategory(id, body.name, Number(body.allocated), body.color);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
