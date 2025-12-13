"use client";

import useSWR from "swr";
import { useMemo } from "react";
import type { Budget } from "@/types/budget";
import type { Category } from "@/types/category";

type CreateBudgetPayload = {
  name: string;
  coupleNames: string;
  eventDate: string;
  total: number;
  notes?: string;
  categories?: Array<{ name: string; allocated: number; color?: string }>;
  timeline?: Array<{ name: string; date: string; time: string; note?: string }>;
};

type AddCategoryPayload = { name: string; allocated: number; color?: string };

type AddExpensePayload = {
  categoryId: string;
  name: string;
  amount: number;
  projected?: number;
  date?: string;
};

type AddChecklistCategoryPayload = { name: string };
type AddChecklistItemPayload = { categoryId: string; name: string };
type AddTimelinePayload = { name: string; date: string; time: string; note?: string };
type UpdateExpensePayload = { name?: string; amount?: number; projected?: number; date?: string };
type UpdateTimelinePayload = { name?: string; date?: string; time?: string; note?: string | null };

const fetcher = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
};

const sendJson = async <T>(url: string, body: unknown, method: "POST" | "PATCH" = "POST"): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json() as Promise<T>;
};

const sendDelete = async (url: string) => {
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const useBudget = (budgetId?: string) => {
  const budgetsKey = "/api/budgets";
  const budgetKey = budgetId ? `/api/budgets/${budgetId}` : null;

  const {
    data: budgetsData,
    isLoading: budgetsLoading,
    mutate: mutateBudgets,
  } = useSWR<Budget[]>(budgetsKey, (url: string) => fetcher<Budget[]>(url));

  const { data: budgetData, mutate: mutateBudget } = useSWR<Budget>(
    budgetKey,
    (url: string) => fetcher<Budget>(url),
  );

  const budgets = budgetsData ?? [];

  const budget = budgetId ? budgetData : budgets[0];

  const totals = useMemo(() => {
    if (!budget)
      return {
        allocated: 0,
        spent: 0,
        remaining: 0,
      };
    const allocated = budget.categories.reduce(
      (sum: number, category: Category) => sum + Number(category.allocated),
      0,
    );
    const spent = budget.categories.reduce(
      (sum: number, category: Category) => sum + Number(category.spent),
      0,
    );
    return {
      allocated,
      spent,
      remaining: Math.max(0, allocated - spent),
    };
  }, [budget]);

  const refresh = async () => {
    await Promise.all([mutateBudgets(), budgetId ? mutateBudget() : Promise.resolve()]);
  };

  const createBudget = async (payload: CreateBudgetPayload) => {
    const budget = await sendJson<Budget>("/api/budgets", payload);
    await refresh();
    return budget;
  };

  const deleteBudget = async (id: string) => {
    await sendDelete(`/api/budgets/${id}`);
    await refresh();
  };

  const addCategory = async (id: string, payload: AddCategoryPayload) => {
    const category = await sendJson(`/api/budgets/${id}/categories`, payload);
    await refresh();
    return category;
  };

  const addExpense = async (id: string, payload: AddExpensePayload) => {
    const expense = await sendJson(`/api/budgets/${id}/expenses`, payload);
    await refresh();
    return expense;
  };

  const deleteExpense = async (budgetIdValue: string, expenseId: string) => {
    await sendDelete(`/api/budgets/${budgetIdValue}/expenses/${expenseId}`);
    await refresh();
  };

  const updateExpense = async (budgetIdValue: string, expenseId: string, payload: UpdateExpensePayload) => {
    const expense = await sendJson(`/api/budgets/${budgetIdValue}/expenses/${expenseId}`, payload, "PATCH");
    await refresh();
    return expense;
  };

  const addChecklistCategory = async (id: string, payload: AddChecklistCategoryPayload) => {
    const category = await sendJson(`/api/budgets/${id}/checklist/categories`, payload);
    await refresh();
    return category;
  };

  const deleteChecklistCategory = async (budgetIdValue: string, categoryId: string) => {
    await sendDelete(`/api/budgets/${budgetIdValue}/checklist/categories/${categoryId}`);
    await refresh();
  };

  const addChecklistItem = async (id: string, payload: AddChecklistItemPayload) => {
    const item = await sendJson(`/api/budgets/${id}/checklist/items`, payload);
    await refresh();
    return item;
  };

  const toggleChecklistItem = async (budgetIdValue: string, itemId: string) => {
    const item = await sendJson(`/api/budgets/${budgetIdValue}/checklist/items/${itemId}`, {}, "PATCH");
    await refresh();
    return item;
  };

  const deleteChecklistItem = async (budgetIdValue: string, itemId: string) => {
    await sendDelete(`/api/budgets/${budgetIdValue}/checklist/items/${itemId}`);
    await refresh();
  };

  const addTimelineEvent = async (id: string, payload: AddTimelinePayload) => {
    const event = await sendJson(`/api/budgets/${id}/timeline`, payload);
    await refresh();
    return event;
  };

  const deleteTimelineEvent = async (budgetIdValue: string, eventId: string) => {
    await sendDelete(`/api/budgets/${budgetIdValue}/timeline/${eventId}`);
    await refresh();
  };

  const updateTimelineEvent = async (budgetIdValue: string, eventId: string, payload: UpdateTimelinePayload) => {
    const event = await sendJson(`/api/budgets/${budgetIdValue}/timeline/${eventId}`, payload, "PATCH");
    await refresh();
    return event;
  };

  const loading = budgetId ? !budgetData : budgetsLoading && budgets.length === 0;

  return {
    budgets,
    budget,
    totals,
    loading,
    createBudget,
    deleteBudget,
    addCategory,
    addExpense,
    deleteExpense,
    updateExpense,
    addChecklistCategory,
    deleteChecklistCategory,
    addChecklistItem,
    deleteChecklistItem,
    toggleChecklistItem,
    addTimelineEvent,
    deleteTimelineEvent,
    updateTimelineEvent,
  };
};
