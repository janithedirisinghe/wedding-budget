import { prisma } from "@/lib/prisma";
import type { DefaultBudgetExpense, DefaultChecklistItem } from "@prisma/client";

async function getBudgetEventDate(budgetId: string) {
  return prisma.budget.findUnique({
    where: { id: budgetId },
    select: { eventDate: true },
  });
}

export async function syncBudgetDefaults(budgetId: string) {
  const budget = await getBudgetEventDate(budgetId);
  if (!budget) return;

  const [defaultCategories, defaultCategoryExpenses, defaultChecklistCategories, defaultChecklistItems, defaultTimelineEvents] = await Promise.all([
    prisma.defaultBudgetCategory.findMany(),
    prisma.defaultBudgetExpense.findMany(),
    prisma.defaultChecklistCategory.findMany(),
    prisma.defaultChecklistItem.findMany(),
    prisma.defaultTimelineEvent.findMany(),
  ]);

  const expensesByCategory = defaultCategoryExpenses.reduce<Record<string, DefaultBudgetExpense[]>>((acc: Record<string, DefaultBudgetExpense[]>, expense: DefaultBudgetExpense) => {
    if (!acc[expense.defaultCategoryId]) acc[expense.defaultCategoryId] = [];
    acc[expense.defaultCategoryId].push(expense);
    return acc;
  }, {});

  const checklistItemsByCategory = defaultChecklistItems.reduce<Record<string, DefaultChecklistItem[]>>((acc: Record<string, DefaultChecklistItem[]>, item: DefaultChecklistItem) => {
    if (!acc[item.defaultCategoryId]) acc[item.defaultCategoryId] = [];
    acc[item.defaultCategoryId].push(item);
    return acc;
  }, {});

  for (const defCategory of defaultCategories) {
    let category = await prisma.category.findFirst({ where: { budgetId, name: defCategory.name } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          budgetId,
          name: defCategory.name,
          allocated: defCategory.allocated,
          color: defCategory.color,
        },
      });
    }

    const categoryExpenses = expensesByCategory[defCategory.id] ?? [];
    for (const defExpense of categoryExpenses) {
      const existingExpense = await prisma.expense.findFirst({ where: { budgetId, categoryId: category.id, name: defExpense.name } });
      if (!existingExpense) {
        await prisma.expense.create({
          data: {
            budgetId,
            categoryId: category.id,
            name: defExpense.name,
            amount: 0,
            projected: null,
            date: new Date(budget.eventDate),
          },
        });
      }
    }
  }

  for (const defChecklistCategory of defaultChecklistCategories) {
    let checklistCategory = await prisma.checklistCategory.findFirst({ where: { budgetId, name: defChecklistCategory.name } });
    if (!checklistCategory) {
      checklistCategory = await prisma.checklistCategory.create({
        data: {
          budgetId,
          name: defChecklistCategory.name,
        },
      });
    }

    const checklistItems = checklistItemsByCategory[defChecklistCategory.id] ?? [];
    for (const defItem of checklistItems) {
      const existingItem = await prisma.checklistItem.findFirst({
        where: { budgetId, categoryId: checklistCategory.id, name: defItem.name },
      });
      if (!existingItem) {
        await prisma.checklistItem.create({
          data: {
            budgetId,
            categoryId: checklistCategory.id,
            name: defItem.name,
          },
        });
      }
    }
  }

  for (const defTimelineEvent of defaultTimelineEvents) {
    const existingEvent = await prisma.timelineEvent.findFirst({ where: { budgetId, name: defTimelineEvent.name } });
    if (existingEvent) continue;

    await prisma.timelineEvent.create({
      data: {
        budgetId,
        name: defTimelineEvent.name,
        date: new Date(budget.eventDate),
        eventTime: "00:00",
        note: null,
      },
    });
  }
}

export async function syncDefaultsForAllBudgets() {
  const budgets = await prisma.budget.findMany({ select: { id: true } });
  for (const budget of budgets) {
    await syncBudgetDefaults(budget.id);
  }
}
