import type { Category } from "./category";
import type { Expense } from "./expense";

export interface Budget {
  id: string;
  name: string;
  coupleNames: string;
  eventDate: string;
  total: number;
  categories: Category[];
  expenses: Expense[];
  createdAt: string;
  notes?: string;
}
