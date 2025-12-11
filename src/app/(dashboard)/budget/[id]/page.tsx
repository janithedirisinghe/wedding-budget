"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useBudget } from "@/hooks/useBudget";
import { currencyFormatter, formatDate } from "@/lib/utils";

type Draft = { name: string; projected: string; actual: string; date: string };

const emptyDraft: Draft = { name: "", projected: "", actual: "", date: "" };

export default function BudgetDetailPage() {
  const params = useParams<{ id: string }>();
  const { budget, addCategory, addExpense } = useBudget(params?.id);

  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", allocated: "" });
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  if (!budget)
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white/60 p-10 text-center shadow-sm dark:border-white/20 dark:bg-slate-900/30">
        <p className="section-heading">Budget missing</p>
        <p className="text-lg text-slate-600 dark:text-slate-200">
          We couldn&apos;t find this budget. It may have been removed or you may have followed an outdated link.
        </p>
      </div>
    );

  const totalSpent = budget.categories.reduce((sum, category) => sum + category.spent, 0);
  const progress = budget.total ? Math.min(100, Math.round((totalSpent / budget.total) * 100)) : 0;

  const handleAddCategory = () => {
    addCategory(budget.id, {
      name: categoryForm.name,
      allocated: Number(categoryForm.allocated),
    });
    setCategoryForm({ name: "", allocated: "" });
    setCategoryModal(false);
  };

  const getDraft = (categoryId: string): Draft => drafts[categoryId] ?? emptyDraft;

  const updateDraft = (categoryId: string, field: keyof Draft, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [categoryId]: {
        ...getDraft(categoryId),
        [field]: value,
      },
    }));
  };

  const handleAddExpense = (categoryId: string) => {
    const draft = getDraft(categoryId);
    if (!draft.name || !draft.actual) {
      alert("Please provide an item name and actual amount.");
      return;
    }

    addExpense(budget.id, {
      categoryId,
      name: draft.name,
      amount: Number(draft.actual),
      projected: draft.projected ? Number(draft.projected) : undefined,
      date: draft.date || new Date().toISOString(),
    });

    setDrafts((prev) => ({
      ...prev,
      [categoryId]: emptyDraft,
    }));
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="section-heading">Budget detail</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">{budget.name}</h1>
          <p className="text-sm text-slate-500">{budget.coupleNames}</p>
        </div>
        <Button variant="secondary" onClick={() => setCategoryModal(true)}>
          Add category
        </Button>
      </header>

      <div className="rounded-[32px] border border-white/40 bg-white/80 p-8 shadow-lg dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-amber-600">Total budget</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{currencyFormatter(budget.total)}</h2>
            <p className="text-sm text-slate-500">Spent {currencyFormatter(totalSpent)}</p>
          </div>
          <div className="w-full max-w-md">
            <p className="text-sm text-slate-500">Progress</p>
            <div className="mt-2 h-3 rounded-full bg-white/50 dark:bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{progress}% allocated</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {budget.categories.map((category) => {
          const categoryExpenses = budget.expenses.filter((expense) => expense.categoryId === category.id);
          const draft = getDraft(category.id);

          return (
            <div key={category.id} className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.4em] text-amber-600">{category.name}</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {currencyFormatter(category.spent)} / {currencyFormatter(category.allocated)}
                  </p>
                  <p className="text-xs text-slate-500">{categoryExpenses.length} items tracked</p>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-slate-500">
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 text-right">Predicted</th>
                      <th className="pb-3 text-right">Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/40 dark:divide-white/10">
                    {categoryExpenses.length > 0 ? (
                      categoryExpenses.map((expense) => (
                        <tr key={expense.id} className="text-slate-700 dark:text-slate-200">
                          <td className="py-3 font-semibold">{expense.name}</td>
                          <td className="py-3 text-slate-500">{expense.date ? formatDate(expense.date) : "-"}</td>
                          <td className="py-3 text-right text-slate-500">
                            {expense.projected ? currencyFormatter(expense.projected) : "-"}
                          </td>
                          <td className="py-3 text-right font-semibold text-rose-500">{currencyFormatter(expense.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          No items yet. Add your first expense for {category.name}.
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-4">
                        <input
                          value={draft.name}
                          onChange={(event) => updateDraft(category.id, "name", event.target.value)}
                          placeholder="Item name"
                          className="w-full rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(event) => updateDraft(category.id, "date", event.target.value)}
                          className="w-full rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="number"
                          placeholder="0"
                          value={draft.projected}
                          onChange={(event) => updateDraft(category.id, "projected", event.target.value)}
                          className="w-full rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-right text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            placeholder="0"
                            value={draft.actual}
                            onChange={(event) => updateDraft(category.id, "actual", event.target.value)}
                            className="w-full rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-right text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                          />
                          <Button size="sm" onClick={() => handleAddExpense(category.id)}>
                            Add
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add category" description="Budget clarity">
        <div className="space-y-4">
          <Input
            label="Category name"
            value={categoryForm.name}
            onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value }))}
          />
          <Input
            label="Allocation"
            type="number"
            value={categoryForm.allocated}
            onChange={(event) => setCategoryForm((form) => ({ ...form, allocated: event.target.value }))}
          />
          <Button className="w-full" onClick={handleAddCategory}>
            Save category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
