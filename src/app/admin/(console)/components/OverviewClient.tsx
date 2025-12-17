"use client";

import Link from "next/link";
import useSWR from "swr";
import { Button } from "@/components/Button";
import {
  AdminUser,
  DefaultBudgetCategory,
  DefaultChecklistCategory,
  DefaultTimelineEvent,
  fetcher,
} from "./admin-shared";

export default function OverviewClient() {
  const { data: usersData, isLoading: usersLoading } = useSWR<{ users: AdminUser[] }>(
    "/api/admin/users",
    (url: string) => fetcher<{ users: AdminUser[] }>(url),
  );
  const { data: budgetDefaults } = useSWR<{ categories: DefaultBudgetCategory[] }>(
    "/api/admin/defaults/budget-categories",
    (url: string) => fetcher<{ categories: DefaultBudgetCategory[] }>(url),
  );
  const { data: checklistDefaults } = useSWR<{ categories: DefaultChecklistCategory[] }>(
    "/api/admin/defaults/checklist/categories",
    (url: string) => fetcher<{ categories: DefaultChecklistCategory[] }>(url),
  );
  const { data: timelineDefaults } = useSWR<{ events: DefaultTimelineEvent[] }>(
    "/api/admin/defaults/timeline",
    (url: string) => fetcher<{ events: DefaultTimelineEvent[] }>(url),
  );

  const users = usersData?.users ?? [];
  const totalBudgets = users.reduce((sum, user) => sum + user.budgets.length, 0);
  const budgetCategoryCount = budgetDefaults?.categories.length ?? 0;
  const defaultExpenseCount = budgetDefaults?.categories.reduce((sum, cat) => sum + cat.expenses.length, 0) ?? 0;
  const checklistCategoryCount = checklistDefaults?.categories.length ?? 0;
  const checklistItemCount =
    checklistDefaults?.categories.reduce((sum, category) => sum + category.items.length, 0) ?? 0;
  const timelineEventCount = timelineDefaults?.events.length ?? 0;

  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Overview</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Track high-level activity across users and the default libraries that shape every new wedding budget.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" href="/admin/users">
            Manage users
          </Button>
          <Button variant="outline" size="sm" href="/admin/defaults/budget">
            Edit defaults
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={usersLoading ? "Loading…" : users.length} hint={`${totalBudgets} total budgets`} />
        <StatCard
          label="Budget defaults"
          value={budgetCategoryCount}
          hint={`${defaultExpenseCount} default expenses`}
        />
        <StatCard label="Checklist" value={checklistCategoryCount} hint={`${checklistItemCount} default tasks`} />
        <StatCard label="Timeline" value={timelineEventCount} hint="Default events" />
      </section>

      <section className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Recent accounts</p>
            <p className="text-sm text-slate-500">Latest admins and couples you created.</p>
          </div>
          <Button variant="outline" size="sm" href="/admin/users">
            View all users
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <table className="hidden min-w-full text-left text-sm text-slate-700 dark:text-slate-100 md:table">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Budgets</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    No users yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                recentUsers.map((user) => (
                  <tr key={user.id} className="border-t border-white/30 bg-white/70 dark:border-white/5 dark:bg-slate-900">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{user.fullName ?? user.username}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email ?? "—"}</td>
                    <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">{user.role.toLowerCase()}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{user.budgets.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="grid gap-3 p-4 md:hidden">
            {recentUsers.length === 0 ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">No users yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{user.fullName ?? user.username}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{user.email ?? "No email"}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Budgets: {user.budgets.length}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/80 p-5 shadow-md shadow-rose-50/70 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      {hint ? <p className="text-sm text-slate-500 dark:text-slate-300">{hint}</p> : null}
    </div>
  );
}
