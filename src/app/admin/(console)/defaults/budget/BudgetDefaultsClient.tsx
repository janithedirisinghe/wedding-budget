"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { DefaultBudgetCategory, fetcher, selectClasses, sendJson } from "../../components/admin-shared";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function BudgetDefaultsClient() {
  const { data: budgetDefaults, mutate: mutateBudgetDefaults, isLoading } = useSWR<{ categories: DefaultBudgetCategory[] }>(
    "/api/admin/defaults/budget-categories",
    (url: string) => fetcher<{ categories: DefaultBudgetCategory[] }>(url),
  );

  const categories = useMemo(() => budgetDefaults?.categories ?? [], [budgetDefaults]);

  const [categoryForm, setCategoryForm] = useState({ name: "", allocated: "", color: "" });
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);

  const [categoryExpenseDrafts, setCategoryExpenseDrafts] = useState<Record<string, string>>({});
  const [categoryExpenseError, setCategoryExpenseError] = useState<string | null>(null);
  const [addingExpenseForCategory, setAddingExpenseForCategory] = useState<string | null>(null);

  const handleAddDefaultCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddingCategory(true);
    setCategoryError(null);
    try {
      const allocatedValue = Number(categoryForm.allocated);
      if (Number.isNaN(allocatedValue) || allocatedValue <= 0) {
        throw new Error("Allocated amount must be a positive number");
      }
      await sendJson("/api/admin/defaults/budget-categories", {
        name: categoryForm.name,
        allocated: allocatedValue,
        color: categoryForm.color || undefined,
        expenses: [],
      });
      setCategoryForm({ name: "", allocated: "", color: "" });
      await mutateBudgetDefaults();
    } catch (error) {
      console.error(error);
      setCategoryError((error as Error).message || "Unable to add category");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddDefaultExpense = async (categoryId: string) => {
    const draft = (categoryExpenseDrafts[categoryId] ?? "").trim();
    if (!draft) {
      setCategoryExpenseError("Provide an expense name.");
      return;
    }
    setAddingExpenseForCategory(categoryId);
    setCategoryExpenseError(null);
    try {
      await sendJson(`/api/admin/defaults/budget-categories/${categoryId}/expenses`, { name: draft });
      setCategoryExpenseDrafts((prev) => ({ ...prev, [categoryId]: "" }));
      await mutateBudgetDefaults();
    } catch (error) {
      console.error(error);
      setCategoryExpenseError("Unable to add default expense");
    } finally {
      setAddingExpenseForCategory(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Budget defaults</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Curate the starting categories and expenses that every new budget receives. Add colors for quick charting.
        </p>
      </div>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Add default category</p>
            <p className="text-sm text-slate-500">Displayed automatically for new budgets.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleAddDefaultCategory}>
          <Input
            label="Category name"
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            label="Allocated amount"
            type="number"
            min="0"
            step="0.01"
            value={categoryForm.allocated}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, allocated: event.target.value }))}
            required
          />
          <Input
            label="Color (optional)"
            value={categoryForm.color}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, color: event.target.value }))}
            placeholder="#FF9AA2"
          />
          <div className="md:col-span-3 flex items-center gap-4">
            <Button type="submit" loading={addingCategory}>
              Add default category
            </Button>
            {categoryError ? <p className="text-sm text-rose-500">{categoryError}</p> : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Default categories</p>
            <p className="text-sm text-slate-500">{isLoading ? "Loading categories…" : `${categories.length} categories`}</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <table className="hidden min-w-full text-left text-sm text-slate-700 dark:text-slate-100 md:table">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Allocated</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Expenses</th>
                <th className="px-4 py-3 text-right">Add expense</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    {isLoading ? "Loading categories…" : "No defaults yet."}
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-t border-white/30 bg-white/70 align-top dark:border-white/5 dark:bg-slate-900">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{category.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{currency.format(Number(category.allocated))}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">
                      {category.color ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                          <span>{category.color}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">
                      {category.expenses.length === 0 ? (
                        <span className="text-slate-500">No default expenses</span>
                      ) : (
                        <ul className="list-disc pl-5 text-sm">
                          {category.expenses.map((expense) => (
                            <li key={expense.id}>{expense.name}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          value={categoryExpenseDrafts[category.id] ?? ""}
                          onChange={(event) =>
                            setCategoryExpenseDrafts((prev) => ({
                              ...prev,
                              [category.id]: event.target.value,
                            }))
                          }
                          placeholder="New expense"
                          className="w-full max-w-xs rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleAddDefaultExpense(category.id)}
                          loading={addingExpenseForCategory === category.id}
                        >
                          Add
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="grid gap-3 p-4 md:hidden">
            {categories.length === 0 ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? "Loading categories…" : "No defaults yet."}
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{category.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {currency.format(Number(category.allocated))}
                      </p>
                      {category.color ? (
                        <p className="text-sm text-slate-500 dark:text-slate-300">Color: {category.color}</p>
                      ) : null}
                    </div>
                    {category.color ? <span className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color }} /> : null}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-200">
                    <p className="text-xs uppercase tracking-[0.25em] text-amber-500">Default expenses</p>
                    {category.expenses.length === 0 ? (
                      <p className="text-slate-500">No default expenses yet.</p>
                    ) : (
                      <ul className="list-disc pl-4">
                        {category.expenses.map((expense) => (
                          <li key={expense.id}>{expense.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={categoryExpenseDrafts[category.id] ?? ""}
                      onChange={(event) =>
                        setCategoryExpenseDrafts((prev) => ({
                          ...prev,
                          [category.id]: event.target.value,
                        }))
                      }
                      placeholder="New expense"
                      className="flex-1 rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddDefaultExpense(category.id)}
                      loading={addingExpenseForCategory === category.id}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {categoryExpenseError ? <p className="mt-3 text-sm text-rose-500">{categoryExpenseError}</p> : null}
      </section>
    </div>
  );
}
