"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { DefaultTimelineEvent, fetcher, sendJson } from "../../components/admin-shared";

export default function TimelineDefaultsClient() {
  const { data: timelineDefaults, mutate: mutateTimelineDefaults, isLoading } = useSWR<{ events: DefaultTimelineEvent[] }>(
    "/api/admin/defaults/timeline",
    (url: string) => fetcher<{ events: DefaultTimelineEvent[] }>(url),
  );

  const timelineEvents = timelineDefaults?.events ?? [];

  const [timelineForm, setTimelineForm] = useState({ name: "" });
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [addingTimeline, setAddingTimeline] = useState(false);

  const handleAddTimelineEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    setAddingTimeline(true);
    setTimelineError(null);
    try {
      await sendJson("/api/admin/defaults/timeline", {
        name: timelineForm.name,
      });
      setTimelineForm({ name: "" });
      await mutateTimelineDefaults();
    } catch (error) {
      console.error(error);
      setTimelineError((error as Error).message || "Unable to add timeline event");
    } finally {
      setAddingTimeline(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Timeline defaults</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Define the core milestones that appear on a new couple's wedding timeline by default.
        </p>
      </div>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Add default event</p>
            <p className="text-sm text-slate-500">Appears on every new budget timeline.</p>
          </div>
        </div>

        <form className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={handleAddTimelineEvent}>
          <Input
            label="Event"
            value={timelineForm.name}
            onChange={(event) => setTimelineForm({ name: event.target.value })}
            required
          />
          <div className="flex items-end justify-end">
            <Button type="submit" loading={addingTimeline}>
              Add timeline event
            </Button>
          </div>
        </form>
        {timelineError ? <p className="mt-3 text-sm text-rose-500">{timelineError}</p> : null}
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Default events</p>
            <p className="text-sm text-slate-500">{isLoading ? "Loading…" : `${timelineEvents.length} events`}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {timelineEvents.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">No timeline defaults yet.</p>
          ) : (
            timelineEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
              >
                <p className="font-semibold text-slate-900 dark:text-white">{event.name}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
