import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, validationError } from "@/lib/http";
import { requireAdminSession } from "@/lib/auth";
import { syncDefaultsForAllBudgets } from "@/lib/defaults";

const createItemSchema = z.object({
  name: z.string().min(1),
});

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = createItemSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const category = await prisma.defaultChecklistCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const item = await prisma.defaultChecklistItem.create({
      data: {
        defaultCategoryId: id,
        name: parsed.data.name,
      },
    });

    await syncDefaultsForAllBudgets();

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
