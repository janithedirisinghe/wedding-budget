export interface Category {
  id: string;
  budgetId: string;
  name: string;
  allocated: number | string;
  spent: number | string;
  color?: string;
}
