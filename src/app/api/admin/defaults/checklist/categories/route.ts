import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";
import { syncDefaultsForAllBudgets } from "@/lib/defaults";

const createSchema = z.object({
  name: z.string().min(2),
  items: z.array(z.string().min(1)).optional(),
});

export async function GET() {
  try {
    await requireAdminSession();
    const categories = await prisma.defaultChecklistCategory.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ categories });
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

    const category = await prisma.defaultChecklistCategory.create({
      data: {
        name: parsed.data.name,
        items: {
          create: parsed.data.items?.map((name) => ({ name })) ?? [],
        },
      },
      include: { items: true },
    });

    await syncDefaultsForAllBudgets();

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
