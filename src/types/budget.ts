import type { Category } from "./category";
import type { ChecklistCategory } from "./checklist";
import type { Expense } from "./expense";
import type { TimelineEvent } from "./timeline";

export interface Budget {
  id: string;
  name: string;
  coupleNames: string;
  eventDate: string;
  total: number | string;
  categories: Category[];
  expenses: Expense[];
  checklist: ChecklistCategory[];
  timeline: TimelineEvent[];
  createdAt: string;
  notes?: string;
}
