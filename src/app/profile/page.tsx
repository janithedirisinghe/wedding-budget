"use client";

import { useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <p className="section-heading">Profile</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Personal settings</h1>
        <p className="text-sm text-slate-500">Update contact info, preferences, and export defaults.</p>
      </div>
      <div className="space-y-10 rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile details</h2>
            <p className="text-sm text-slate-500">Only your partner and collaborators can see this info.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <Input label="Full name" defaultValue="Avery Parker" />
            <Input label="Partner name" defaultValue="Morgan Hale" />
          </div>
          <Input label="Email" type="email" defaultValue="avery@serenite.com" />
        </section>
        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Preferences</h2>
            <p className="text-sm text-slate-500">Adjust notifications and export defaults.</p>
          </div>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg border border-rose-200 text-rose-500 focus:ring-rose-300" />
            Receive weekly digest
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded-lg border border-rose-200 text-rose-500 focus:ring-rose-300" />
            Notify me for planner comments
          </label>
        </section>
        <Button
          onClick={() => {
            setMessage("Profile updated");
            setTimeout(() => setMessage(null), 2500);
          }}
        >
          Save changes
        </Button>
        {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
      </div>
    </div>
  );
}
