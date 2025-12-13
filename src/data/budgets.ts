import { prisma } from "@/lib/prisma";
import { syncBudgetDefaults } from "@/lib/defaults";

const budgetInclude = {
  categories: true,
  expenses: {
    where: { deleted: false },
  },
  checklist: {
    where: { deleted: false },
    include: {
      items: {
        where: { deleted: false },
      },
    },
  },
  timeline: {
    where: { deleted: false },
  },
};

export async function getBudgetsForUser(userId: string) {
  return prisma.budget.findMany({
    where: { userId, deleted: false },
    include: budgetInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getBudgetById(userId: string, budgetId: string) {
  return prisma.budget.findFirst({
    where: { id: budgetId, userId, deleted: false },
    include: budgetInclude,
  });
}

interface CreateBudgetInput {
  userId: string;
  name: string;
  coupleNames: string;
  eventDate: Date;
  total: number;
  notes?: string;
  categories?: Array<{ name: string; allocated: number; color?: string }>;
  timeline?: Array<{ name: string; date: Date; time: string; note?: string }>;
}

export async function createBudget(input: CreateBudgetInput) {
  const created = await prisma.budget.create({
    data: {
      userId: input.userId,
      name: input.name,
      coupleNames: input.coupleNames,
      eventDate: input.eventDate,
      total: input.total,
      notes: input.notes,
      categories: {
        create: input.categories?.map((category) => ({
          name: category.name,
          allocated: category.allocated,
          color: category.color,
        })),
      },
      timeline: {
        create: input.timeline?.map((event) => ({
          name: event.name,
          date: event.date,
          eventTime: event.time,
          note: event.note,
        })),
      },
    },
    include: budgetInclude,
  });

  await syncBudgetDefaults(created.id);

  const refreshed = await prisma.budget.findUnique({ where: { id: created.id }, include: budgetInclude });
  return refreshed!;
}

export async function addCategory(budgetId: string, name: string, allocated: number, color?: string) {
  return prisma.category.create({
    data: {
      budgetId,
      name,
      allocated,
      color,
    },
  });
}

export async function addExpense(budgetId: string, payload: { categoryId: string; name: string; amount: number; projected?: number; date?: Date; note?: string }) {
  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        budgetId,
        categoryId: payload.categoryId,
        name: payload.name,
        amount: payload.amount,
        projected: payload.projected,
        date: payload.date ?? new Date(),
        note: payload.note,
      },
    });

    await tx.category.update({
      where: { id: payload.categoryId },
      data: {
        spent: { increment: payload.amount },
      },
    });

    return expense;
  });
}

export async function addChecklistCategory(budgetId: string, name: string) {
  return prisma.checklistCategory.create({
    data: {
      budgetId,
      name,
    },
  });
}

export async function addChecklistItem(categoryId: string, budgetId: string, name: string) {
  return prisma.checklistItem.create({
    data: {
      budgetId,
      categoryId,
      name,
    },
  });
}

export async function toggleChecklistItem(itemId: string) {
  const existing = await prisma.checklistItem.findFirst({ where: { id: itemId, deleted: false } });
  if (!existing) return null;
  return prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      completed: !existing.completed,
      lastUpdated: new Date(),
    },
  });
}

export async function addTimelineEvent(budgetId: string, payload: { name: string; date: Date; time: string; note?: string }) {
  return prisma.timelineEvent.create({
    data: {
      budgetId,
      name: payload.name,
      date: payload.date,
      eventTime: payload.time,
      note: payload.note,
    },
  });
}

export async function softDeleteBudget(userId: string, budgetId: string) {
  const budget = await prisma.budget.findFirst({ where: { id: budgetId, userId, deleted: false } });
  if (!budget) return null;
  return prisma.budget.update({
    where: { id: budgetId },
    data: { deleted: true },
  });
}

export async function softDeleteExpense(budgetId: string, expenseId: string) {
  const expense = await prisma.expense.findFirst({ where: { id: expenseId, budgetId, deleted: false } });
  if (!expense) return null;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({ where: { id: expenseId }, data: { deleted: true } });
    await tx.category.update({
      where: { id: expense.categoryId },
      data: { spent: { decrement: Number(expense.amount) } },
    });
    return updated;
  });
}

export async function softDeleteChecklistCategory(budgetId: string, categoryId: string) {
  const category = await prisma.checklistCategory.findFirst({ where: { id: categoryId, budgetId, deleted: false } });
  if (!category) return null;

  await prisma.checklistItem.updateMany({ where: { categoryId, budgetId, deleted: false }, data: { deleted: true } });

  return prisma.checklistCategory.update({ where: { id: categoryId }, data: { deleted: true } });
}

export async function softDeleteChecklistItem(budgetId: string, itemId: string) {
  const item = await prisma.checklistItem.findFirst({ where: { id: itemId, budgetId, deleted: false } });
  if (!item) return null;
  return prisma.checklistItem.update({ where: { id: itemId }, data: { deleted: true } });
}

export async function softDeleteTimelineEvent(budgetId: string, eventId: string) {
  const event = await prisma.timelineEvent.findFirst({ where: { id: eventId, budgetId, deleted: false } });
  if (!event) return null;
  return prisma.timelineEvent.update({ where: { id: eventId }, data: { deleted: true } });
}
