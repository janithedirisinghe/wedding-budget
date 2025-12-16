"use client";

import { useBudget } from "@/hooks/useBudget";
import { Button } from "@/components/Button";
import { Card } from "@/components/ui/card";
import { currencyFormatter, formatDate } from "@/lib/utils";

export default function BudgetListPage() {
  const { budgets, loading, deleteBudget } = useBudget();

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-heading">Your budgets</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Choose a plan to open</h1>
          <p className="text-sm text-slate-500">Manage multiple celebrations or planning scenarios.</p>
        </div>
        <Button href="/budget/new">Create new budget</Button>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {loading ? (
          <p className="text-sm text-slate-500">Loading your budgets…</p>
        ) : null}
        {!loading &&
          budgets.map((budget) => (
          <Card key={budget.id} className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-amber-600">{formatDate(budget.eventDate)}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{budget.name}</h3>
                <p className="text-sm text-slate-500">{budget.coupleNames}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-rose-500">{currencyFormatter(budget.total)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm("Delete this budget? You can restore later since it won't be permanently removed.")) return;
                    await deleteBudget(budget.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{budget.categories.length} categories</span>
              <span>{budget.expenses.length} expenses logged</span>
            </div>
            <Button href={`/budget/${budget.id}`} variant="secondary" className="w-full">
              Open budget
            </Button>
          </Card>
        ))}
        {!loading && budgets.length === 0 ? <p className="text-slate-500">No budgets yet.</p> : null}
      </div>
    </div>
  );
}
