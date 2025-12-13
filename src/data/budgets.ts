import { prisma } from "@/lib/prisma";

const budgetInclude = {
  categories: true,
  expenses: true,
  checklist: {
    include: {
      items: true,
    },
  },
  timeline: true,
};

export async function getBudgetsForUser(userId: string) {
  return prisma.budget.findMany({
    where: { userId },
    include: budgetInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getBudgetById(userId: string, budgetId: string) {
  return prisma.budget.findFirst({
    where: { id: budgetId, userId },
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
  return prisma.budget.create({
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
  const expense = await prisma.expense.create({
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

  await prisma.category.update({
    where: { id: payload.categoryId },
    data: {
      spent: { increment: payload.amount },
    },
  });

  return expense;
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
  const existing = await prisma.checklistItem.findUnique({ where: { id: itemId } });
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
