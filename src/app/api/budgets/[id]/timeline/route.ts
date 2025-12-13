import { NextRequest, NextResponse } from "next/server";
import { addTimelineEvent } from "@/data/budgets";
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
    const event = await addTimelineEvent(id, {
      name: body.name,
      date: new Date(body.date),
      time: body.time,
      note: body.note,
    });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
