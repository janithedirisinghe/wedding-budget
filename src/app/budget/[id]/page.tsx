"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useBudget } from "@/hooks/useBudget";
import { currencyFormatter } from "@/lib/utils";

export default function BudgetDetailPage() {
  const params = useParams<{ id: string }>();
  const { budget, addCategory, addExpense } = useBudget(params?.id);

  const [categoryModal, setCategoryModal] = useState(false);
  const [expenseModal, setExpenseModal] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ name: "", allocated: "" });
  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "", categoryId: "", date: "" });

  const categoryOptions = useMemo(() => {
    if (!budget) return [];
    return budget.categories.map((category) => (
      <option key={category.id} value={category.id}>
        {category.name}
      </option>
    ));
  }, [budget]);

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

  const handleAddExpense = () => {
    addExpense(budget.id, {
      categoryId: expenseForm.categoryId,
      name: expenseForm.name,
      amount: Number(expenseForm.amount),
      date: expenseForm.date || new Date().toISOString(),
    });
    setExpenseForm({ name: "", amount: "", categoryId: "", date: "" });
    setExpenseModal(false);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="section-heading">Budget detail</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">{budget.name}</h1>
          <p className="text-sm text-slate-500">{budget.coupleNames}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setCategoryModal(true)}>
            Add category
          </Button>
          <Button onClick={() => setExpenseModal(true)}>Add expense</Button>
        </div>
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
      <div className="grid gap-6 md:grid-cols-2">
        {budget.categories.map((category) => (
          <div key={category.id} className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-600">{category.name}</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {currencyFormatter(category.spent)} / {currencyFormatter(category.allocated)}
                </p>
                <p className="text-xs text-slate-500">{budget.expenses.filter((expense) => expense.categoryId === category.id).length} expenses</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-500">
              {budget.expenses
                .filter((expense) => expense.categoryId === category.id)
                .map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <span>{expense.name}</span>
                    <span className="font-semibold text-rose-500">{currencyFormatter(expense.amount)}</span>
                  </div>
                ))}
              {budget.expenses.filter((expense) => expense.categoryId === category.id).length === 0 ? (
                <p className="text-xs text-slate-400">No expenses yet.</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add category" description="Budget clarity">
        <div className="space-y-4">
          <Input label="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm((form) => ({ ...form, name: event.target.value }))} />
          <Input label="Allocation" type="number" value={categoryForm.allocated} onChange={(event) => setCategoryForm((form) => ({ ...form, allocated: event.target.value }))} />
          <Button className="w-full" onClick={handleAddCategory}>
            Save category
          </Button>
        </div>
      </Modal>

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add expense" description="Track every promise">
        <div className="space-y-4">
          <Input label="Expense name" value={expenseForm.name} onChange={(event) => setExpenseForm((form) => ({ ...form, name: event.target.value }))} />
          <Input label="Amount" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm((form) => ({ ...form, amount: event.target.value }))} />
          <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-medium">Category</span>
            <select
              className="rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
              value={expenseForm.categoryId}
              onChange={(event) => setExpenseForm((form) => ({ ...form, categoryId: event.target.value }))}
            >
              <option value="">Select category</option>
              {categoryOptions}
            </select>
          </label>
          <Input label="Date" type="date" value={expenseForm.date} onChange={(event) => setExpenseForm((form) => ({ ...form, date: event.target.value }))} />
          <Button className="w-full" onClick={handleAddExpense}>
            Save expense
          </Button>
        </div>
      </Modal>
    </div>
  );
}
