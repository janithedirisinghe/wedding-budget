"use client";

import { BudgetChart } from "@/app/dashboard/components/BudgetChart";
import { CategoryList } from "@/app/dashboard/components/CategoryList";
import { ExpenseTable } from "@/app/dashboard/components/ExpenseTable";
import { OverviewCard } from "@/app/dashboard/components/OverviewCard";
import { Sidebar } from "@/components/Sidebar";
import { useBudget } from "@/hooks/useBudget";
import { currencyFormatter } from "@/lib/utils";
import { Button } from "@/components/Button";
import { PiggyBank, Receipt, Sparkles, Wallet } from "lucide-react";

export default function DashboardPage() {
  const { budget, budgets, totals } = useBudget();

  const chartData = budget?.categories.map((category) => ({
    name: category.name,
    allocated: category.allocated,
    spent: category.spent,
  })) ?? [];

  const expenses = budget?.expenses.map((expense) => ({
    ...expense,
    categoryName: budget.categories.find((category) => category.id === expense.categoryId)?.name,
  })) ?? [];

  const overviewMetrics = [
    {
      label: "Total allocated",
      value: currencyFormatter(totals.allocated || 0),
      change: "+8% vs last plan",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      label: "Total spent",
      value: currencyFormatter(totals.spent || 0),
      change: "On track",
      icon: <Receipt className="h-5 w-5" />,
    },
    {
      label: "Remaining",
      value: currencyFormatter(totals.remaining || 0),
      change: "6% below forecast",
      icon: <PiggyBank className="h-5 w-5" />,
    },
    {
      label: "Active budgets",
      value: `${budgets.length}`,
      change: "+1 collaborative",
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex gap-10">
      <Sidebar />
      <div className="flex-1 space-y-12">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-heading">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
              Welcome back, your celebration is in motion
            </h1>
            {budget ? <p className="text-sm text-slate-500">Active budget: {budget.name}</p> : null}
          </div>
          <Button href="/budget/new">Create budget</Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {overviewMetrics.map((metric) => (
            <OverviewCard key={metric.label} {...metric} change={metric.change} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BudgetChart data={chartData} />
          {budget ? <CategoryList categories={budget.categories} /> : null}
        </div>

        {budget ? <ExpenseTable expenses={expenses} /> : null}
      </div>
    </div>
  );
}
