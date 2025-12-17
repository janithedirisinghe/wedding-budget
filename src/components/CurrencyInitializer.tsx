"use client";

import { useEffect } from "react";
import type { Currency } from "@/types/currency";

declare global {
  interface Window {
    __appCurrencyCode?: string;
    __appCurrencySymbol?: string | null;
  }
}

export function CurrencyInitializer({ currency }: { currency?: Currency | null }) {
  useEffect(() => {
    if (!currency) return;
    window.__appCurrencyCode = currency.code;
    window.__appCurrencySymbol = currency.symbol ?? null;
    try {
      localStorage.setItem("app:currencyCode", currency.code);
      if (currency.symbol) {
        localStorage.setItem("app:currencySymbol", currency.symbol);
      }
    } catch {
      /* ignore storage issues */
    }
  }, [currency]);

  return null;
}
