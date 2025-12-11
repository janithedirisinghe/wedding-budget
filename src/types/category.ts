export interface Category {
  id: string;
  budgetId: string;
  name: string;
  allocated: number;
  spent: number;
  color?: string;
}
