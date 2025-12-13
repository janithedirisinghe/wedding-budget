"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api } from "@/lib/axios";

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState({ fullName: "", partnerName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (!active) return;
        setProfile({
          fullName: data.user.fullName ?? "",
          partnerName: data.user.partnerName ?? "",
          email: data.user.email ?? "",
        });
      } catch {
        if (!active) return;
        setMessage("Unable to load your profile right now.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.replace("/login");
    router.refresh();
  };

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
            <Input
              label="Full name"
              value={profile.fullName}
              disabled={loading}
              onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <Input
              label="Partner name"
              value={profile.partnerName}
              disabled={loading}
              onChange={(event) => setProfile((prev) => ({ ...prev, partnerName: event.target.value }))}
            />
          </div>
          <Input label="Email" type="email" value={profile.email} disabled readOnly />
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
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={loading}
            onClick={() => {
              setMessage("Profile updated (coming soon)");
              setTimeout(() => setMessage(null), 2500);
            }}
          >
          Save changes
          </Button>
          <Button type="button" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </div>
        {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
      </div>
    </div>
  );
}
