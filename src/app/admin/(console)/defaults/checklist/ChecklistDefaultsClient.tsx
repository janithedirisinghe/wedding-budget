"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { DefaultChecklistCategory, fetcher, selectClasses, sendJson } from "../../components/admin-shared";

export default function ChecklistDefaultsClient() {
  const { data: checklistDefaults, mutate: mutateChecklistDefaults, isLoading } = useSWR<{ categories: DefaultChecklistCategory[] }>(
    "/api/admin/defaults/checklist/categories",
    (url: string) => fetcher<{ categories: DefaultChecklistCategory[] }>(url),
  );

  const checklistCategories = useMemo(() => checklistDefaults?.categories ?? [], [checklistDefaults]);

  const [checklistCategoryForm, setChecklistCategoryForm] = useState({ name: "" });
  const [addingChecklistCategory, setAddingChecklistCategory] = useState(false);
  const [checklistItemForm, setChecklistItemForm] = useState({ categoryId: "", name: "" });
  const [addingChecklistItem, setAddingChecklistItem] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);

  const handleAddChecklistCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setChecklistError(null);
    setAddingChecklistCategory(true);
    try {
      await sendJson("/api/admin/defaults/checklist/categories", { name: checklistCategoryForm.name });
      setChecklistCategoryForm({ name: "" });
      await mutateChecklistDefaults();
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
      await mutateChecklistDefaults();
    } catch (error) {
      console.error(error);
      setChecklistError("Unable to add checklist item");
    } finally {
      setAddingChecklistItem(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Checklist defaults</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Build the shared checklist categories and items couples see by default. Update once, reuse everywhere.
        </p>
      </div>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="grid gap-6 md:grid-cols-2">
          <form className="space-y-4" onSubmit={handleAddChecklistCategory}>
            <p className="section-heading">New checklist category</p>
            <Input
              label="Category name"
              value={checklistCategoryForm.name}
              onChange={(event) => setChecklistCategoryForm({ name: event.target.value })}
              required
            />
            <Button type="submit" loading={addingChecklistCategory}>
              Add category
            </Button>
          </form>

          <form className="space-y-4" onSubmit={handleAddChecklistItem}>
            <p className="section-heading">New checklist item</p>
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
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Default checklist library</p>
            <p className="text-sm text-slate-500">{isLoading ? "Loading…" : `${checklistCategories.length} categories`}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {checklistCategories.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No checklist defaults yet.</p>
          ) : (
            checklistCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">{category.name}</p>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                    {category.items.length} items
                  </span>
                </div>
                {category.items.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No default tasks yet.</p>
                ) : (
                  <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-200">
                    {category.items.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
