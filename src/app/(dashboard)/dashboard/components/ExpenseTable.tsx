import type { Expense } from "@/types/expense";
import { currencyFormatter, formatDate } from "@/lib/utils";

interface ExpenseExtended extends Expense {
  categoryName?: string;
}

interface ExpenseTableProps {
  expenses: ExpenseExtended[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  return (
    <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-heading">Latest activity</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Recent expenses</h3>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-slate-500">
              <th className="pb-3">Expense</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Date</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40 dark:divide-white/10">
            {expenses.map((expense) => (
              <tr key={expense.id} className="text-slate-700 dark:text-slate-200">
                <td className="py-3 font-semibold">{expense.name}</td>
                <td className="py-3 text-slate-500">{expense.categoryName ?? "-"}</td>
                <td className="py-3 text-slate-500">{formatDate(expense.date)}</td>
                <td className="py-3 text-right font-semibold text-rose-500">
                  {currencyFormatter(expense.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
