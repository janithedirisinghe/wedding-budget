"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget } from "@/types/budget";
import type { Category } from "@/types/category";
import type { ChecklistCategory } from "@/types/checklist";
import type { Expense } from "@/types/expense";
import type { TimelineEvent } from "@/types/timeline";
import { generateId } from "@/lib/utils";

interface BudgetInput {
  name: string;
  coupleNames: string;
  eventDate: string;
  total: number;
  categories?: Array<Pick<Category, "name" | "allocated">>;
  notes?: string;
  timeline?: Array<Pick<TimelineEvent, "name" | "date" | "time">>;
}

interface BudgetStore {
  budgets: Budget[];
  activeBudgetId?: string;
  createBudget: (input: BudgetInput) => Budget;
  updateBudget: (id: string, payload: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  setActiveBudget: (id: string) => void;
  addCategory: (budgetId: string, category: Pick<Category, "name" | "allocated">) => void;
  addExpense: (
    budgetId: string,
    expense: Pick<Expense, "categoryId" | "name" | "amount" | "date" | "projected" | "note">
  ) => void;
  removeExpense: (budgetId: string, expenseId: string) => void;
  addChecklistCategory: (budgetId: string, name: string) => void;
  addChecklistItem: (budgetId: string, categoryId: string, name: string) => void;
  toggleChecklistItem: (budgetId: string, itemId: string) => void;
  addTimelineEvent: (budgetId: string, payload: Pick<TimelineEvent, "name" | "date" | "time" | "note">) => void;
}

const seedBudget: Budget = {
  id: "demo-budget",
  name: "Parker Wedding",
  coupleNames: "Avery & Morgan",
  eventDate: new Date().toISOString(),
  total: 65000,
  notes: "Created for quick onboarding preview.",
  createdAt: new Date().toISOString(),
  categories: [
    {
      id: "cat-venue",
      budgetId: "demo-budget",
      name: "Venue",
      allocated: 25000,
      spent: 18000,
      color: "from-rose-400 to-amber-300",
    },
    {
      id: "cat-catering",
      budgetId: "demo-budget",
      name: "Catering",
      allocated: 15000,
      spent: 9200,
      color: "from-amber-400 to-amber-200",
    },
    {
      id: "cat-fashion",
      budgetId: "demo-budget",
      name: "Attire",
      allocated: 8000,
      spent: 3000,
      color: "from-rose-300 to-rose-200",
    },
  ],
  expenses: [
    {
      id: "exp-1",
      budgetId: "demo-budget",
      categoryId: "cat-venue",
      name: "Venue Deposit",
      amount: 10000,
      projected: 12000,
      date: new Date().toISOString(),
    },
    {
      id: "exp-2",
      budgetId: "demo-budget",
      categoryId: "cat-catering",
      name: "Menu Tasting",
      amount: 1200,
      projected: 1500,
      date: new Date().toISOString(),
    },
  ],
  checklist: [
    {
      id: "chk-ceremony",
      budgetId: "demo-budget",
      name: "Ceremony",
      items: [
        {
          id: "chk-item-1",
          budgetId: "demo-budget",
          categoryId: "chk-ceremony",
          name: "Book officiant",
          lastUpdated: new Date().toISOString(),
          completed: true,
        },
        {
          id: "chk-item-2",
          budgetId: "demo-budget",
          categoryId: "chk-ceremony",
          name: "Design vows",
          lastUpdated: new Date().toISOString(),
          completed: false,
        },
      ],
    },
    {
      id: "chk-reception",
      budgetId: "demo-budget",
      name: "Reception",
      items: [
        {
          id: "chk-item-3",
          budgetId: "demo-budget",
          categoryId: "chk-reception",
          name: "Confirm caterer menu",
          lastUpdated: new Date().toISOString(),
          completed: false,
        },
      ],
    },
  ],
  timeline: [
    {
      id: "timeline-1",
      budgetId: "demo-budget",
      name: "Welcome drinks",
      date: new Date().toISOString(),
      time: "15:00",
    },
    {
      id: "timeline-2",
      budgetId: "demo-budget",
      name: "Ceremony",
      date: new Date().toISOString(),
      time: "17:00",
    },
  ],
};

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      budgets: [seedBudget],
      activeBudgetId: seedBudget.id,
      createBudget: (input) => {
        const newBudget: Budget = {
          id: generateId(),
          name: input.name,
          coupleNames: input.coupleNames,
          eventDate: input.eventDate,
          total: input.total,
          notes: input.notes,
          createdAt: new Date().toISOString(),
          categories:
            input.categories?.map((category) => ({
              id: generateId(),
              budgetId: "temp", // replaced below
              name: category.name,
              allocated: category.allocated,
              spent: 0,
            })) ?? [],
          expenses: [],
          checklist: [],
          timeline:
            input.timeline?.map((event) => ({
              id: generateId(),
              budgetId: "temp", // replaced below
              name: event.name,
              date: event.date,
              time: event.time,
            })) ?? [],
        };

        newBudget.categories = newBudget.categories.map((category) => ({
          ...category,
          budgetId: newBudget.id,
        }));
        newBudget.timeline = newBudget.timeline.map((event) => ({
          ...event,
          budgetId: newBudget.id,
        }));

        set((state) => ({
          budgets: [...state.budgets, newBudget],
          activeBudgetId: newBudget.id,
        }));

        return newBudget;
      },
      updateBudget: (id, payload) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...payload } : budget,
          ),
        }));
      },
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
          activeBudgetId:
            state.activeBudgetId === id ? state.budgets.at(0)?.id : state.activeBudgetId,
        }));
      },
      setActiveBudget: (id) => set({ activeBudgetId: id }),
      addCategory: (budgetId, category) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === budgetId
              ? {
                  ...budget,
                  categories: [
                    ...budget.categories,
                    {
                      id: generateId(),
                      budgetId,
                      name: category.name,
                      allocated: category.allocated,
                      spent: 0,
                    },
                  ],
                }
              : budget,
          ),
        }));
      },
      addExpense: (budgetId, expense) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === budgetId
              ? {
                  ...budget,
                  expenses: [
                    ...budget.expenses,
                    {
                      id: generateId(),
                      budgetId,
                      ...expense,
                    },
                  ],
                  categories: budget.categories.map((category) =>
                    category.id === expense.categoryId
                      ? { ...category, spent: Number(category.spent) + Number(expense.amount) }
                      : category,
                  ),
                }
              : budget,
          ),
        }));
      },
      removeExpense: (budgetId, expenseId) => {
        set((state) => ({
          budgets: state.budgets.map((budget) => {
            if (budget.id !== budgetId) return budget;
            const expense = budget.expenses.find((item) => item.id === expenseId);
            return {
              ...budget,
              expenses: budget.expenses.filter((item) => item.id !== expenseId),
              categories: expense
                ? budget.categories.map((category) =>
                    category.id === expense.categoryId
                      ? { ...category, spent: Math.max(0, Number(category.spent) - Number(expense.amount)) }
                      : category,
                  )
                : budget.categories,
            };
          }),
        }));
      },
      addChecklistCategory: (budgetId, name) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === budgetId
              ? {
                  ...budget,
                  checklist: [
                    ...budget.checklist,
                    {
                      id: generateId(),
                      budgetId,
                      name,
                      items: [],
                    } satisfies ChecklistCategory,
                  ],
                }
              : budget,
          ),
        }));
      },
      addChecklistItem: (budgetId, categoryId, name) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          budgets: state.budgets.map((budget) => {
            if (budget.id !== budgetId) return budget;
            return {
              ...budget,
              checklist: budget.checklist.map((category) =>
                category.id === categoryId
                  ? {
                      ...category,
                      items: [
                        ...category.items,
                        {
                          id: generateId(),
                          budgetId,
                          categoryId,
                          name,
                          lastUpdated: timestamp,
                          completed: false,
                        },
                      ],
                    }
                  : category,
              ),
            };
          }),
        }));
      },
      toggleChecklistItem: (budgetId, itemId) => {
        const timestamp = new Date().toISOString();
        set((state) => ({
          budgets: state.budgets.map((budget) => {
            if (budget.id !== budgetId) return budget;
            return {
              ...budget,
              checklist: budget.checklist.map((category) => ({
                ...category,
                items: category.items.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        completed: !item.completed,
                        lastUpdated: timestamp,
                      }
                    : item,
                ),
              })),
            };
          }),
        }));
      },
      addTimelineEvent: (budgetId, payload) => {
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === budgetId
              ? {
                  ...budget,
                  timeline: [
                    ...budget.timeline,
                    {
                      id: generateId(),
                      budgetId,
                      ...payload,
                    },
                  ],
                }
              : budget,
          ),
        }));
      },
    }),
    { name: "wedding-budget-store" },
  ),
);
