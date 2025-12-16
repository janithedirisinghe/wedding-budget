"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useBudget } from "@/hooks/useBudget";

export default function TimelinePage() {
  const { budget, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, loading } = useBudget();
  const [form, setForm] = useState({ name: "", date: "", time: "", note: "" });
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState({ name: "", date: "", time: "", note: "" });
  const events = [...(budget?.timeline ?? [])].sort((a, b) => {
    const parseDate = (value?: string | null) => {
      if (!value) return Number.MAX_SAFE_INTEGER;
      const timestamp = Date.parse(value);
      return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
    };

    const resolveTime = (value?: string | null) => value ?? "";

    const dateComparison = parseDate(a.date) - parseDate(b.date);
    if (dateComparison !== 0) return dateComparison;
    return resolveTime(a.time ?? (a as { eventTime?: string }).eventTime).localeCompare(
      resolveTime(b.time ?? (b as { eventTime?: string }).eventTime),
    );
  });

  const getEventTime = (event: (typeof events)[number]) => event.time ?? (event as { eventTime?: string }).eventTime ?? "";

  const formatDateLabel = (value?: string) => {
    if (!value) return "Set date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Set date";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading)
    return (
      <div className="rounded-3xl border border-white/30 bg-white/70 p-10 text-center shadow-sm dark:border-white/10 dark:bg-slate-900/30">
        <p className="section-heading">Loading timeline</p>
        <p className="text-lg text-slate-600 dark:text-slate-200">Gathering your schedule…</p>
      </div>
    );

  if (!budget)
    return (
      <div className="rounded-3xl border border-dashed border-rose-200 bg-white/60 p-10 text-center shadow-sm dark:border-white/20 dark:bg-slate-900/30">
        <p className="section-heading">No active budget</p>
        <p className="text-lg text-slate-600 dark:text-slate-200">Create a budget to start building your wedding timeline.</p>
      </div>
    );

  const handleAddEvent = async () => {
    if (!form.name.trim() || !form.date || !form.time) return;
    await addTimelineEvent(budget.id, {
      name: form.name.trim(),
      date: form.date,
      time: form.time,
      note: form.note?.trim() || undefined,
    });
    setForm({ name: "", date: "", time: "", note: "" });
  };

  const startEditing = (event: (typeof events)[number]) => {
    setEditingEventId(event.id);
    setEditingForm({
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : "",
      time: getEventTime(event),
      note: event.note ?? "",
    });
  };

  const handleUpdateEvent = async () => {
    if (!budget || !editingEventId || !editingForm.name.trim()) return;
    await updateTimelineEvent(budget.id, editingEventId, {
      name: editingForm.name.trim(),
      date: editingForm.date,
      time: editingForm.time,
      note: editingForm.note.trim() ? editingForm.note.trim() : null,
    });
    setEditingEventId(null);
    setEditingForm({ name: "", date: "", time: "", note: "" });
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="section-heading">Wedding timeline</p>
          <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">Map every moment</h1>
          <p className="text-sm text-slate-500">List key events with their dates and times so your day flows effortlessly.</p>
        </div>
      </header>

      <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg dark:border-white/10 dark:bg-slate-900/60">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">Add a timeline entry</p>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Input
            label="Item"
            placeholder="First look"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          />
          <Input
            label="Time"
            type="time"
            value={form.time}
            onChange={(event) => setForm((prev) => ({ ...prev, time: event.target.value }))}
          />
          <Input
            label="Note (optional)"
            placeholder="Special instructions"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          />
        </div>
        <Button className="mt-4" onClick={handleAddEvent}>
          Add to timeline
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-rose-200 bg-white/60 p-12 text-center shadow-sm dark:border-white/20 dark:bg-slate-900/30">
          <p className="text-xl font-semibold text-slate-800 dark:text-white">No events yet</p>
          <p className="mt-2 text-sm text-slate-500">Start outlining ceremony, reception, and travel milestones to keep everyone aligned.</p>
        </div>
      ) : (
        <ol className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-400 to-amber-300" />
                <span className="mt-1 h-full w-[2px] bg-rose-100" aria-hidden />
              </div>
              <div className="flex-1 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-amber-600">{formatDateLabel(event.date)}</p>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{event.name}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-rose-100/70 px-3 py-1 text-xs font-medium text-rose-500 dark:bg-rose-500/20 dark:text-rose-100">
                      {getEventTime(event) || "--:--"}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => startEditing(event)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!budget) return;
                        if (!confirm("Delete this timeline event?")) return;
                        await deleteTimelineEvent(budget.id, event.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {event.note ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">{event.note}</p> : null}
                {editingEventId === event.id ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <Input label="Name" value={editingForm.name} onChange={(e) => setEditingForm((prev) => ({ ...prev, name: e.target.value }))} />
                    <Input label="Date" type="date" value={editingForm.date} onChange={(e) => setEditingForm((prev) => ({ ...prev, date: e.target.value }))} />
                    <Input label="Time" type="time" value={editingForm.time} onChange={(e) => setEditingForm((prev) => ({ ...prev, time: e.target.value }))} />
                    <Input label="Note" value={editingForm.note} onChange={(e) => setEditingForm((prev) => ({ ...prev, note: e.target.value }))} />
                    <div className="md:col-span-4 flex items-center gap-3">
                      <Button size="sm" onClick={handleUpdateEvent}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingEventId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
