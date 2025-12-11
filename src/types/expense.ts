export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  note?: string;
}
