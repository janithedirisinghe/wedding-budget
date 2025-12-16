"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { Budget } from "@/types/budget";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

type AdminUser = {
  id: string;
  username: string;
  fullName: string | null;
  partnerName: string | null;
  email: string | null;
  role: "USER" | "ADMIN";
  budgets: Budget[];
};

type DefaultBudgetCategory = {
  id: string;
  name: string;
  allocated: number | string;
  color: string | null;
  expenses: Array<{ id: string; name: string }>;
};

type DefaultChecklistCategory = {
  id: string;
  name: string;
  items: Array<{ id: string; name: string }>;
};

type DefaultTimelineEvent = {
  id: string;
  name: string;
};

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return (await response.json()) as T;
};

async function sendJson<T>(url: string, body?: unknown, method: "POST" | "PATCH" | "DELETE" = "POST"): Promise<T> {
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

const selectClasses =
  "rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white";

export default function AdminDashboardClient({ adminName }: { adminName: string }) {
  const {
    data: usersData,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR<{ users: AdminUser[] }>("/api/admin/users", (url: string) => fetcher<{ users: AdminUser[] }>(url));

  const { data: budgetDefaults, mutate: mutateBudgetDefaults } = useSWR<{ categories: DefaultBudgetCategory[] }>(
    "/api/admin/defaults/budget-categories",
    (url: string) => fetcher<{ categories: DefaultBudgetCategory[] }>(url),
  );

  const { data: checklistDefaults, mutate: mutateChecklistDefaults } = useSWR<{ categories: DefaultChecklistCategory[] }>(
    "/api/admin/defaults/checklist/categories",
    (url: string) => fetcher<{ categories: DefaultChecklistCategory[] }>(url),
  );

  const { data: timelineDefaults, mutate: mutateTimelineDefaults } = useSWR<{ events: DefaultTimelineEvent[] }>(
    "/api/admin/defaults/timeline",
    (url: string) => fetcher<{ events: DefaultTimelineEvent[] }>(url),
  );

  const [newUserForm, setNewUserForm] = useState({ fullName: "", partnerName: "", email: "", password: "", role: "USER" as "USER" | "ADMIN" });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const [categoryForm, setCategoryForm] = useState({ name: "", allocated: "", color: "" });
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryExpenseDrafts, setCategoryExpenseDrafts] = useState<Record<string, string>>({});
  const [categoryExpenseError, setCategoryExpenseError] = useState<string | null>(null);
  const [addingExpenseForCategory, setAddingExpenseForCategory] = useState<string | null>(null);

  const [checklistCategoryForm, setChecklistCategoryForm] = useState({ name: "" });
  const [addingChecklistCategory, setAddingChecklistCategory] = useState(false);
  const [checklistItemForm, setChecklistItemForm] = useState({ categoryId: "", name: "" });
  const [addingChecklistItem, setAddingChecklistItem] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const [timelineForm, setTimelineForm] = useState({ name: "" });
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [addingTimeline, setAddingTimeline] = useState(false);

  const users = useMemo(() => usersData?.users ?? [], [usersData]);
  const budgetCategories = budgetDefaults?.categories ?? [];
  const checklistCategories = checklistDefaults?.categories ?? [];
  const timelineEvents = timelineDefaults?.events ?? [];

  const totalBudgets = useMemo(() => users.reduce((sum, user) => sum + user.budgets.length, 0), [users]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreatingUser(true);
    setUserFormError(null);
    try {
      await sendJson("/api/admin/users", newUserForm);
      setNewUserForm({ fullName: "", partnerName: "", email: "", password: "", role: "USER" });
      await mutateUsers();
    } catch (error) {
      console.error(error);
      setUserFormError("Unable to create user. Please check the form and try again.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateUser = async (userId: string, payload: Record<string, unknown>) => {
    await sendJson(`/api/admin/users/${userId}`, payload, "PATCH");
    await mutateUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user and all of their data?")) return;
    await sendJson(`/api/admin/users/${userId}`, undefined, "DELETE");
    await mutateUsers();
  };

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
      await Promise.all([mutateBudgetDefaults(), mutateUsers()]);
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
      await Promise.all([mutateBudgetDefaults(), mutateUsers()]);
    } catch (error) {
      console.error(error);
      setCategoryExpenseError("Unable to add default expense");
    } finally {
      setAddingExpenseForCategory(null);
    }
  };

  const handleAddChecklistCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setChecklistError(null);
    setAddingChecklistCategory(true);
    try {
      await sendJson("/api/admin/defaults/checklist/categories", { name: checklistCategoryForm.name });
      setChecklistCategoryForm({ name: "" });
      await Promise.all([mutateChecklistDefaults(), mutateUsers()]);
    } catch (error) {
      console.error(error);
      setChecklistError("Unable to add checklist category");
    } finally {
      setAddingChecklistCategory(false);
    }
  };

  const handleAddChecklistItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!checklistItemForm.categoryId) {
      setChecklistError("Select a category");
      return;
    }
    setAddingChecklistItem(true);
    setChecklistError(null);
    try {
      await sendJson(`/api/admin/defaults/checklist/categories/${checklistItemForm.categoryId}/items`, {
        name: checklistItemForm.name,
      });
      setChecklistItemForm({ categoryId: "", name: "" });
      await Promise.all([mutateChecklistDefaults(), mutateUsers()]);
    } catch (error) {
      console.error(error);
      setChecklistError("Unable to add checklist item");
    } finally {
      setAddingChecklistItem(false);
    }
  };

  const handleAddTimelineEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddingTimeline(true);
    setTimelineError(null);
    try {
      await sendJson("/api/admin/defaults/timeline", {
        name: timelineForm.name,
      });
      setTimelineForm({ name: "" });
      await Promise.all([mutateTimelineDefaults(), mutateUsers()]);
    } catch (error) {
      console.error(error);
      setTimelineError((error as Error).message || "Unable to add timeline event");
    } finally {
      setAddingTimeline(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-4xl font-semibold text-slate-900">Welcome back, {adminName || "Admin"}</h1>
        <p className="text-sm text-slate-600">Manage accounts and curate the default experience for every couple.</p>
      </header>

      <section className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-heading">User accounts</p>
            <p className="text-sm text-slate-500">{usersLoading ? "Loading users…" : `${users.length} users · ${totalBudgets} budgets`}</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <Input label="Full name" value={newUserForm.fullName} onChange={(event) => setNewUserForm((prev) => ({ ...prev, fullName: event.target.value }))} required />
          <Input label="Partner name" value={newUserForm.partnerName} onChange={(event) => setNewUserForm((prev) => ({ ...prev, partnerName: event.target.value }))} />
          <Input label="Email" type="email" value={newUserForm.email} onChange={(event) => setNewUserForm((prev) => ({ ...prev, email: event.target.value }))} required />
          <Input label="Temporary password" type="password" value={newUserForm.password} onChange={(event) => setNewUserForm((prev) => ({ ...prev, password: event.target.value }))} required />
          <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-medium">Role</span>
            <select
              className={selectClasses}
              value={newUserForm.role}
              onChange={(event) => setNewUserForm((prev) => ({ ...prev, role: event.target.value as "USER" | "ADMIN" }))}
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <div className="md:col-span-2 flex items-center gap-4">
            <Button type="submit" loading={creatingUser}>
              Create account
            </Button>
            {userFormError ? <p className="text-sm text-rose-500">{userFormError}</p> : null}
          </div>
        </form>

        <div className="mt-8 space-y-6">
          {users.map((user) => (
            <UserCard key={user.id} user={user} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-heading">Default budget categories</p>
            <p className="text-sm text-slate-500">Appears for every budget automatically.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-3" onSubmit={handleAddDefaultCategory}>
          <Input label="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} required />
          <Input
            label="Allocated amount"
            type="number"
            min="0"
            step="0.01"
            value={categoryForm.allocated}
            onChange={(event) => setCategoryForm((prev) => ({ ...prev, allocated: event.target.value }))}
            required
          />
          <Input label="Color (optional)" value={categoryForm.color} onChange={(event) => setCategoryForm((prev) => ({ ...prev, color: event.target.value }))} />
          <div className="md:col-span-3 flex items-center gap-4">
            <Button type="submit" loading={addingCategory}>
              Add default category
            </Button>
            {categoryError ? <p className="text-sm text-rose-500">{categoryError}</p> : null}
          </div>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {budgetCategories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-white/40 bg-white/90 p-4 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-800 dark:text-white">{category.name}</p>
              <p className="text-slate-500">Allocated: {category.allocated}</p>
              {category.color ? <p className="text-slate-500">Color: {category.color}</p> : null}
              <div className="mt-3 space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Default expenses</p>
                {category.expenses.length === 0 ? (
                  <p className="text-sm text-slate-500">No default expenses yet.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-200">
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
          ))}
        </div>
        {categoryExpenseError ? <p className="mt-3 text-sm text-rose-500">{categoryExpenseError}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-heading">Default checklist</p>
            <p className="text-sm text-slate-500">Curate categories and tasks once, share everywhere.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form className="space-y-4" onSubmit={handleAddChecklistCategory}>
            <Input label="New checklist category" value={checklistCategoryForm.name} onChange={(event) => setChecklistCategoryForm({ name: event.target.value })} required />
            <Button type="submit" loading={addingChecklistCategory}>
              Add category
            </Button>
          </form>

          <form className="space-y-4" onSubmit={handleAddChecklistItem}>
            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium">Category</span>
              <select
                className={selectClasses}
                value={checklistItemForm.categoryId}
                onChange={(event) => setChecklistItemForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                required
              >
                <option value="">Select category</option>
                {checklistCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Checklist item"
              value={checklistItemForm.name}
              onChange={(event) => setChecklistItemForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <Button type="submit" loading={addingChecklistItem}>
              Add checklist item
            </Button>
          </form>
        </div>
        {checklistError ? <p className="mt-4 text-sm text-rose-500">{checklistError}</p> : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {checklistCategories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-800 dark:text-white">{category.name}</p>
              {category.items.length === 0 ? (
                <p className="text-sm text-slate-500">No default tasks yet.</p>
              ) : (
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-200">
                  {category.items.map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/30 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-heading">Default timeline events</p>
            <p className="text-sm text-slate-500">Use days offset to position events around the wedding date.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAddTimelineEvent}>
          <Input label="Event" value={timelineForm.name} onChange={(event) => setTimelineForm({ name: event.target.value })} required />
          <div className="flex items-center gap-4">
            <Button type="submit" loading={addingTimeline}>
              Add timeline event
            </Button>
            {timelineError ? <p className="text-sm text-rose-500">{timelineError}</p> : null}
          </div>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {timelineEvents.map((event) => (
            <div key={event.id} className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-800 dark:text-white">{event.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function UserCard({
  user,
  onUpdate,
  onDelete,
}: {
  user: AdminUser;
  onUpdate: (userId: string, payload: Record<string, unknown>) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName ?? "",
    partnerName: user.partnerName ?? "",
    email: user.email ?? "",
    username: user.username,
    role: user.role,
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        partnerName: form.partnerName,
        email: form.email,
        username: form.username,
        role: form.role,
      };
      if (form.password) {
        payload.password = form.password;
      }
      await onUpdate(user.id, payload);
      setForm((prev) => ({ ...prev, password: "" }));
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Unable to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{user.role.toLowerCase()}</p>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{user.fullName ?? user.username}</h3>
          <p className="text-sm text-slate-500">{user.email ?? "No email"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing((prev) => !prev)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button variant="ghost" className="text-rose-500" onClick={() => onDelete(user.id)}>
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
          <Input label="Full name" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <Input label="Partner name" value={form.partnerName} onChange={(event) => setForm((prev) => ({ ...prev, partnerName: event.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <Input label="Username" value={form.username} onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))} />
          <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-medium">Role</span>
            <select className={selectClasses} value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as "USER" | "ADMIN" }))}>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <Input
            label="Reset password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Leave blank to keep current"
          />
          <div className="md:col-span-2 flex items-center gap-4">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          </div>
        </form>
      ) : null}

      {user.budgets.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {user.budgets.map((budget) => (
            <div key={budget.id} className="rounded-xl border border-white/30 bg-white/80 p-3 text-sm shadow-sm dark:border-white/10 dark:bg-slate-900/40">
              <p className="font-semibold text-slate-800 dark:text-white">{budget.name}</p>
              <p className="text-slate-500">Event: {new Date(budget.eventDate).toLocaleDateString()}</p>
              <p className="text-slate-500">Categories: {budget.categories.length} · Expenses: {budget.expenses.length}</p>
              <p className="text-slate-500">Checklist items: {budget.checklist.reduce((sum, category) => sum + category.items.length, 0)}</p>
              <p className="text-slate-500">Timeline events: {budget.timeline.length}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No budgets yet.</p>
      )}
    </div>
  );
}
