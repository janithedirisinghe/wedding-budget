export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  name: string;
  amount: number;
  projected?: number;
  date: string;
  note?: string;
}
