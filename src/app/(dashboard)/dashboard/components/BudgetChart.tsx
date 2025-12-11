"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { currencyFormatter } from "@/lib/utils";

interface ChartPoint {
  name: string;
  allocated: number;
  spent: number;
}

interface BudgetChartProps {
  data: ChartPoint[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-white/30 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-xl dark:border-white/10 dark:bg-slate-900/90 dark:text-white">
      <p className="font-semibold">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center justify-between gap-6 text-xs">
          <span>{entry.name}</span>
          <span className="font-semibold">{currencyFormatter(Number(entry.value))}</span>
        </p>
      ))}
    </div>
  );
};

export function BudgetChart({ data }: BudgetChartProps) {
  return (
    <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-heading">Spending momentum</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Budget vs Actuals</h3>
        </div>
      </div>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAllocated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f472b6" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fcd34d" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#fcd34d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" />
            <XAxis dataKey="name" stroke="rgba(71, 85, 105, 0.8)" />
            <YAxis stroke="rgba(71, 85, 105, 0.8)" tickFormatter={(value) => currencyFormatter(value as number)} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="allocated" stroke="#fb7185" fillOpacity={1} fill="url(#colorAllocated)" />
            <Area type="monotone" dataKey="spent" stroke="#fbbf24" fillOpacity={1} fill="url(#colorSpent)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
