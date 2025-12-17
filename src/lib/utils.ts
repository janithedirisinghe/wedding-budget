import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

declare global {
  interface Window {
    __appCurrencyCode?: string;
    __appCurrencySymbol?: string | null;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getPreferredCurrency = () => {
  if (typeof window === "undefined") return "USD";
  if (window.__appCurrencyCode) return window.__appCurrencyCode;
  try {
    const stored = localStorage.getItem("app:currencyCode");
    return stored || "USD";
  } catch {
    return "USD";
  }
};

export const currencyFormatter = (value: number | string, currency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: safeCurrencyCode(currency || getPreferredCurrency()),
  }).format(Number(value));

const safeCurrencyCode = (code: string | undefined | null): string => {
  const normalized = (code ?? "").trim().toUpperCase();
  if (!normalized) return "USD";
  try {
    // Throws on invalid ISO 4217 codes; catch and fall back.
    new Intl.NumberFormat("en-US", { style: "currency", currency: normalized }).format(1);
    return normalized;
  } catch {
    return "USD";
  }
};

export const percentFormatter = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);

export const formatDate = (date: string | number | Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

export const generateId = () => crypto.randomUUID();
