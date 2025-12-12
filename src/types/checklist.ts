export interface ChecklistItem {
  id: string;
  budgetId: string;
  categoryId: string;
  name: string;
  lastUpdated: string;
  completed: boolean;
}

export interface ChecklistCategory {
  id: string;
  budgetId: string;
  name: string;
  items: ChecklistItem[];
}
