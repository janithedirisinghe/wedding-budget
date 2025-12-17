"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { cn } from "@/lib/utils";
import { AdminUser, fetcher, selectClasses, sendJson } from "../components/admin-shared";

const PAGE_SIZE = 6;

export default function UserManagementClient() {
  const {
    data: usersData,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR<{ users: AdminUser[] }>("/api/admin/users", (url: string) => fetcher<{ users: AdminUser[] }>(url));

  const [newUserForm, setNewUserForm] = useState({
    fullName: "",
    partnerName: "",
    email: "",
    password: "",
    role: "USER" as "USER" | "ADMIN",
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const users = useMemo(() => usersData?.users ?? [], [usersData]);
  const totalBudgets = useMemo(() => users.reduce((sum, user) => sum + user.budgets.length, 0), [users]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const term = search.toLowerCase();
    return users.filter((user) =>
      [user.fullName, user.username, user.email, user.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const pagedUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Users</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Create admin or couple accounts, update credentials, and inspect their budgets. Pagination and filtering keep long lists quick to scan.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/70 dark:bg-slate-800/80 dark:ring-white/10">
            {usersLoading ? "Loading users…" : `${users.length} users`}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm ring-1 ring-white/70 dark:bg-slate-800/80 dark:ring-white/10">
            {totalBudgets} total budgets
          </span>
        </div>
      </div>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-1">
            <p className="section-heading">Create new account</p>
            <p className="text-sm text-slate-500">Admins and couples can be provisioned directly from here.</p>
          </div>
          <div className="w-full max-w-md">
            <Input
              placeholder="Search users by name, email, role"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleCreateUser}>
          <Input
            label="Full name"
            value={newUserForm.fullName}
            onChange={(event) => setNewUserForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
          <Input
            label="Partner name"
            value={newUserForm.partnerName}
            onChange={(event) => setNewUserForm((prev) => ({ ...prev, partnerName: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={newUserForm.email}
            onChange={(event) => setNewUserForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <Input
            label="Temporary password"
            type="password"
            value={newUserForm.password}
            onChange={(event) => setNewUserForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
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
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">All users</p>
            <p className="text-sm text-slate-500">Paginated list with quick editing.</p>
          </div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <table className="hidden min-w-full text-left text-sm text-slate-700 dark:text-slate-100 md:table">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Budgets</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    {usersLoading ? "Loading users…" : "No users match this filter."}
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user) => (
                  <UserRow key={user.id} user={user} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />
                ))
              )}
            </tbody>
          </table>

          <div className="grid gap-3 p-4 md:hidden">
            {pagedUsers.length === 0 ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                {usersLoading ? "Loading users…" : "No users match this filter."}
              </p>
            ) : (
              pagedUsers.map((user) => (
                <UserCardMobile key={user.id} user={user} onUpdate={handleUpdateUser} onDelete={handleDeleteUser} />
              ))
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        Previous
      </Button>
      <span>
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        Next
      </Button>
    </div>
  );
}

function UserRow({
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
    <>
      <tr className="border-t border-white/30 bg-white/70 dark:border-white/5 dark:bg-slate-900">
        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{user.fullName ?? user.username}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{user.email ?? "—"}</td>
        <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">{user.role.toLowerCase()}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{user.budgets.length}</td>
        <td className="px-4 py-3 text-right">
          <div className="inline-flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing((prev) => !prev)}>
              {editing ? "Close" : "Edit"}
            </Button>
            <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => onDelete(user.id)}>
              Delete
            </Button>
          </div>
        </td>
      </tr>
      {editing ? (
        <tr className="border-t border-white/30 bg-white/60 dark:border-white/5 dark:bg-slate-900/80">
          <td colSpan={5} className="px-4 py-4">
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSave}>
              <Input
                label="Full name"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
              <Input
                label="Partner name"
                value={form.partnerName}
                onChange={(event) => setForm((prev) => ({ ...prev, partnerName: event.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <Input
                label="Username"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              />
              <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium">Role</span>
                <select
                  className={selectClasses}
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as "USER" | "ADMIN" }))}
                >
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
          </td>
        </tr>
      ) : null}
    </>
  );
}

function UserCardMobile({
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
    <div className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-slate-900 dark:text-white">{user.fullName ?? user.username}</p>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user.email ?? "No email"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Budgets: {user.budgets.length}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
          {user.role.toLowerCase()}
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Close" : "Edit"}
        </Button>
        <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => onDelete(user.id)}>
          Delete
        </Button>
      </div>

      {editing ? (
        <form className="mt-3 space-y-3" onSubmit={handleSave}>
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
          />
          <Input
            label="Partner name"
            value={form.partnerName}
            onChange={(event) => setForm((prev) => ({ ...prev, partnerName: event.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <Input
            label="Username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
          />
          <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
            <span className="font-medium">Role</span>
            <select
              className={selectClasses}
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as "USER" | "ADMIN" }))}
            >
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
          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
