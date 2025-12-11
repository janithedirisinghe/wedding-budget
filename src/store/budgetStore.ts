"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget } from "@/types/budget";
import type { Category } from "@/types/category";
import type { Expense } from "@/types/expense";
import { generateId } from "@/lib/utils";

interface BudgetInput {
  name: string;
  coupleNames: string;
  eventDate: string;
  total: number;
  categories?: Array<Pick<Category, "name" | "allocated">>;
  notes?: string;
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
        };

        newBudget.categories = newBudget.categories.map((category) => ({
          ...category,
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
                      ? { ...category, spent: category.spent + expense.amount }
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
                      ? { ...category, spent: Math.max(0, category.spent - expense.amount) }
                      : category,
                  )
                : budget.categories,
            };
          }),
        }));
      },
    }),
    { name: "wedding-budget-store" },
  ),
);
