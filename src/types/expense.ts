export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  name: string;
  amount: number | string;
  projected?: number | string;
  date: string;
  note?: string;
}
