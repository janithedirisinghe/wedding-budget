"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useBudget } from "@/hooks/useBudget";
import { formatDate } from "@/lib/utils";

export default function ChecklistPage() {
  const { budget, addChecklistCategory, addChecklistItem, toggleChecklistItem, deleteChecklistCategory, deleteChecklistItem, loading } = useBudget();
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (loading)
    return (
      <div className="rounded-3xl border border-white/30 bg-white/70 p-10 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/30">
        <p className="section-heading">Loading checklist</p>
        <p className="text-lg text-slate-600 dark:text-slate-200">Fetching your latest tasks…</p>
      </div>
    );

  if (!budget)
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white/60 p-10 text-center shadow-sm dark:border-white/20 dark:bg-slate-900/30">
        <p className="section-heading">No active budget</p>
        <p className="text-lg text-slate-600 dark:text-slate-200">Create a budget first to start tracking your checklist.</p>
      </div>
    );

  const checklist = budget.checklist ?? [];

  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    await addChecklistCategory(budget.id, { name: categoryName.trim() });
    setCategoryName("");
    setCategoryModal(false);
  };

  const handleAddItem = async (categoryId: string) => {
    const value = drafts[categoryId]?.trim();
    if (!value) return;
    await addChecklistItem(budget.id, { categoryId, name: value });
    setDrafts((prev) => ({
      ...prev,
      [categoryId]: "",
    }));
  };

  const updateDraft = (categoryId: string, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="section-heading">Wedding checklist</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Stay on top of every detail</h1>
          <p className="text-sm text-slate-500">Organize tasks by category, capture last updates, and tick them off as you go.</p>
        </div>
        <Button variant="secondary" onClick={() => setCategoryModal(true)}>
          Add category
        </Button>
      </header>

      {checklist.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white/60 p-12 text-center shadow-sm dark:border-white/20 dark:bg-slate-900/30">
          <p className="text-xl font-semibold text-slate-800 dark:text-white">Build your first checklist category</p>
          <p className="mt-2 text-sm text-slate-500">Group related tasks together, then add checklist items right inside each category card.</p>
          <Button className="mt-6" onClick={() => setCategoryModal(true)}>
            Start a category
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {checklist.map((category) => {
            const completed = category.items.filter((item) => item.completed).length;
            const total = category.items.length;
            return (
              <div key={category.id} className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.4em] text-amber-600">{category.name}</p>
                    <p className="text-xs text-slate-500">
                      {completed}/{total || 0} items complete
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete this checklist category and its items?")) return;
                      await deleteChecklistCategory(budget.id, category.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-widest text-slate-500">
                        <th className="pb-3">Item</th>
                        <th className="pb-3">Last update</th>
                        <th className="pb-3 text-right">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40 dark:divide-white/10">
                      {category.items.length > 0 ? (
                        category.items.map((item) => (
                          <tr key={item.id} className="text-slate-700 dark:text-slate-200">
                            <td className="py-3 font-semibold">{item.name}</td>
                            <td className="py-3 text-slate-500">{formatDate(item.lastUpdated ?? new Date().toISOString())}</td>
                            <td className="py-3">
                              <label className="flex items-center justify-end gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => toggleChecklistItem(budget.id, item.id)}
                                  className="h-4 w-4 rounded border border-rose-200 text-rose-500 focus:ring-rose-300"
                                />
                                <span className={item.completed ? "text-rose-500" : "text-slate-500"}>
                                  {item.completed ? "Done" : "Pending"}
                                </span>
                              </label>
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  if (!confirm("Delete this checklist item?")) return;
                                  await deleteChecklistItem(budget.id, item.id);
                                }}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-400">
                            No checklist items yet. Add one below.
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-4">
                          <input
                            value={drafts[category.id] ?? ""}
                            onChange={(event) => updateDraft(category.id, event.target.value)}
                            placeholder="Add a checklist item"
                            className="w-full rounded-2xl border border-rose-100/60 bg-white/80 px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40"
                          />
                        </td>
                        <td className="py-4 text-sm text-slate-400">Last update recorded automatically</td>
                        <td className="py-4 text-right">
                          <Button size="sm" onClick={() => handleAddItem(category.id)}>
                            Add
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add checklist category" description="Group related tasks">
        <div className="space-y-4">
          <Input
            label="Category name"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="e.g. Ceremony, Reception, Attire"
          />
          <Button className="w-full" onClick={handleAddCategory}>
            Save category
          </Button>
        </div>
      </Modal>
    </div>
  );
}
