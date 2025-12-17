import type { Budget } from "@/types/budget";
import type { Currency } from "@/types/currency";

export type AdminUser = {
  id: string;
  username: string;
  fullName: string | null;
  partnerName: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  budgets: Budget[];
  currency?: Currency | null;
};

export type DefaultBudgetCategory = {
  id: string;
  name: string;
  allocated: number | string;
  color: string | null;
  expenses: Array<{ id: string; name: string }>;
};

export type DefaultChecklistCategory = {
  id: string;
  name: string;
  items: Array<{ id: string; name: string }>;
};

export type DefaultTimelineEvent = {
  id: string;
  name: string;
};

export const selectClasses =
  "rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white";

export const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return (await response.json()) as T;
};

export async function sendJson<T>(url: string, body?: unknown, method: "POST" | "PATCH" | "DELETE" = "POST"): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return (await response.json()) as T;
}
