"use client";

import { useMemo } from "react";
import { useBudgetStore } from "@/store/budgetStore";

export const useBudget = (budgetId?: string) => {
  const {
    budgets,
    activeBudgetId,
    setActiveBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    addExpense,
    removeExpense,
    addChecklistCategory,
    addChecklistItem,
    toggleChecklistItem,
    addTimelineEvent,
  } = useBudgetStore();

  const budget = useMemo(() => {
    if (budgetId) return budgets.find((item) => item.id === budgetId);
    return budgets.find((item) => item.id === activeBudgetId) ?? budgets[0];
  }, [budgets, activeBudgetId, budgetId]);

  const totals = useMemo(() => {
    if (!budget)
      return {
        allocated: 0,
        spent: 0,
        remaining: 0,
      };
    const allocated = budget.categories.reduce((sum, category) => sum + category.allocated, 0);
    const spent = budget.categories.reduce((sum, category) => sum + category.spent, 0);
    return {
      allocated,
      spent,
      remaining: Math.max(0, allocated - spent),
    };
  }, [budget]);

  return {
    budgets,
    budget,
    totals,
    activeBudgetId,
    setActiveBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    addExpense,
    removeExpense,
    addChecklistCategory,
    addChecklistItem,
    toggleChecklistItem,
    addTimelineEvent,
  };
};
