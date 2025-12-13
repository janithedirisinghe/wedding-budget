import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import { handleApiError } from "@/lib/http";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  note: z.string().optional().nullable(),
});

type RouteContext = { params: Promise<{ id: string; eventId: string }> | { id: string; eventId: string } };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id, eventId } = await context.params;
    const userId = await requireUserId();
    const budget = await prisma.budget.findFirst({ where: { id, userId }, select: { id: true } });
    if (!budget) {
      return NextResponse.json({ message: "Budget not found" }, { status: 404 });
    }

    const timelineEvent = await prisma.timelineEvent.findFirst({ where: { id: eventId, budgetId: id } });
    if (!timelineEvent) {
      return NextResponse.json({ message: "Timeline event not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payload", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data: Prisma.TimelineEventUpdateInput = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.time !== undefined) data.eventTime = parsed.data.time;
    if (parsed.data.note !== undefined) data.note = parsed.data.note;
    if (parsed.data.date) {
      data.date = new Date(parsed.data.date);
    }

    const updated = await prisma.timelineEvent.update({ where: { id: eventId }, data });
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}
