import { NextRequest, NextResponse } from "next/server";
import { toggleChecklistItem } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string; itemId: string }> | { id: string; itemId: string };
};

export async function PATCH(_: NextRequest, context: RouteContext) {
  try {
    await requireUserId();
    const { itemId } = await context.params;
    const item = await toggleChecklistItem(itemId);
    if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}
