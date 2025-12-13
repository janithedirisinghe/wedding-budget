import { NextResponse } from "next/server";
import { getBudgetsForUser, createBudget } from "@/data/budgets";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

type CategoryPayload = {
  name: string;
  allocated: number;
  color?: string;
};

type TimelinePayload = {
  name: string;
  date: string;
  time: string;
  note?: string;
};

export async function GET() {
  try {
    const userId = await requireUserId();
    const budgets = await getBudgetsForUser(userId);
    return NextResponse.json(budgets);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const categories = Array.isArray(body.categories)
      ? body.categories.map((category: CategoryPayload) => ({
          name: category.name,
          allocated: Number(category.allocated),
          color: category.color,
        }))
      : undefined;

    const timeline = Array.isArray(body.timeline)
      ? body.timeline.map((event: TimelinePayload) => ({
          name: event.name,
          date: new Date(event.date),
          time: event.time,
          note: event.note,
        }))
      : undefined;

    const budget = await createBudget({
      userId,
      name: body.name,
      coupleNames: body.coupleNames,
      eventDate: new Date(body.eventDate),
      total: Number(body.total),
      notes: body.notes,
      categories,
      timeline,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
