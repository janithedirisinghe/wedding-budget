import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";
import { syncDefaultsForAllBudgets } from "@/lib/defaults";

const createSchema = z.object({
  name: z.string().min(2),
});

export async function GET() {
  try {
    await requireAdminSession();
    const events = await prisma.defaultTimelineEvent.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const event = await prisma.defaultTimelineEvent.create({
      data: {
        name: parsed.data.name,
      },
    });

    await syncDefaultsForAllBudgets();

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
