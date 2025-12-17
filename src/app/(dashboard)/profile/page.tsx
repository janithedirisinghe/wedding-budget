"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { api } from "@/lib/axios";
import type { Currency } from "@/types/currency";

export default function ProfilePage() {
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState({ fullName: "", partnerName: "", email: "", currencyId: "" });
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: me }, { data: currencyResponse }] = await Promise.all([
          api.get("/auth/me"),
          api.get("/currencies"),
        ]);
        if (!active) return;
        setCurrencies(currencyResponse.currencies ?? []);
        setProfile({
          fullName: me.user.fullName ?? "",
          partnerName: me.user.partnerName ?? "",
          email: me.user.email ?? "",
          currencyId: me.user.currency?.id ?? "",
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

  const handleSave = async () => {
    setMessage(null);
    try {
      const { data } = await api.patch("/auth/me", {
        fullName: profile.fullName || undefined,
        partnerName: profile.partnerName || undefined,
        currencyId: profile.currencyId || undefined,
      });
      setMessage("Preferences saved");
      try {
        localStorage.setItem("app:currencyCode", data.user.currency?.code ?? "USD");
        if (data.user.currency?.symbol) {
          localStorage.setItem("app:currencySymbol", data.user.currency.symbol);
        }
        window.__appCurrencyCode = data.user.currency?.code;
        window.__appCurrencySymbol = data.user.currency?.symbol ?? null;
      } catch {
        /* ignore */
      }
      setTimeout(() => setMessage(null), 2500);
    } catch (error) {
      console.error(error);
      setMessage("Unable to save preferences");
    }
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium">Currency</span>
              <select
                className="rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
                value={profile.currencyId}
                onChange={(event) => setProfile((prev) => ({ ...prev, currencyId: event.target.value }))}
                disabled={loading}
              >
                <option value="">Default (USD)</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.code} — {currency.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">Amounts in the app will use this currency.</span>
            </label>
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
          <Button disabled={loading} onClick={handleSave}>
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
