import type { Category } from "@/types/category";
import { currencyFormatter } from "@/lib/utils";

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  return (
    <div className="rounded-[32px] border border-white/50 bg-white/80 p-6 shadow-lg dark:border-white/5 dark:bg-slate-900/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-heading">Categories</p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Where love is allocated</h3>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {categories.map((category) => {
          const pct = Math.min(100, Math.round((category.spent / category.allocated) * 100));
          return (
            <div key={category.id}>
              <div className="flex items-center justify-between text-sm font-medium text-slate-600 dark:text-slate-200">
                <span>{category.name}</span>
                <span>
                  {currencyFormatter(category.spent)} / {currencyFormatter(category.allocated)}
                </span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-rose-100/70 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
