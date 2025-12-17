"use client";

import useSWR from "swr";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { fetcher, sendJson } from "../components/admin-shared";
import type { Currency } from "@/types/currency";

export default function AdminCurrenciesClient() {
  const { data, mutate, isLoading } = useSWR<{ currencies: Currency[] }>("/api/admin/currencies", (url: string) => fetcher<{ currencies: Currency[] }>(url));
  const currencies = data?.currencies ?? [];

  const [form, setForm] = useState({ code: "USD", name: "US Dollar", symbol: "$" });
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await sendJson("/api/admin/currencies", { code: form.code.toUpperCase(), name: form.name, symbol: form.symbol || undefined });
      setForm({ code: "", name: "", symbol: "" });
      await mutate();
    } catch (err) {
      console.error(err);
      setError("Unable to add currency");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this currency? Users assigned to it will be blocked.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/currencies/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Delete failed");
      }
      await mutate();
    } catch (err) {
      console.error(err);
      setError("Unable to delete currency (it might be in use)");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Currencies</h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Add or remove supported currencies. Users and budgets display amounts using their selected currency.
        </p>
      </div>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleCreate}>
          <Input
            label="Code"
            placeholder="USD"
            value={form.code}
            onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            required
          />
          <Input
            label="Name"
            placeholder="US Dollar"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <Input
            label="Symbol"
            placeholder="$"
            value={form.symbol}
            onChange={(event) => setForm((prev) => ({ ...prev, symbol: event.target.value }))}
          />
          <div className="flex items-end gap-3">
            <Button type="submit" loading={creating}>
              Add currency
            </Button>
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg shadow-rose-50/50 ring-1 ring-white/40 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-heading">Supported currencies</p>
            <p className="text-sm text-slate-500">{isLoading ? "Loading…" : `${currencies.length} currencies`}</p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <table className="hidden min-w-full text-left text-sm text-slate-700 dark:text-slate-100 md:table">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Symbol</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currencies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500 dark:text-slate-400">
                    {isLoading ? "Loading…" : "No currencies yet."}
                  </td>
                </tr>
              ) : (
                currencies.map((currency) => (
                  <tr key={currency.id} className="border-t border-white/30 bg-white/70 dark:border-white/5 dark:bg-slate-900">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{currency.code}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{currency.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-200">{currency.symbol ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500"
                        onClick={() => handleDelete(currency.id)}
                        loading={deletingId === currency.id}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="grid gap-3 p-4 md:hidden">
            {currencies.length === 0 ? (
              <p className="text-center text-sm text-slate-500 dark:text-slate-400">{isLoading ? "Loading…" : "No currencies yet."}</p>
            ) : (
              currencies.map((currency) => (
                <div
                  key={currency.id}
                  className="rounded-2xl border border-white/50 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">{currency.code}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{currency.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-200">{currency.symbol ?? ""}</span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500"
                      onClick={() => handleDelete(currency.id)}
                      loading={deletingId === currency.id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
      </section>
    </div>
  );
}
