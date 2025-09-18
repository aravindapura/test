export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

export interface Summary {
  incomeTotal: number;
  expenseTotal: number;
  balance: number;
  byCategory: Record<string, CategorySummary>;
}

export interface CategorySummary {
  income: number;
  expense: number;
  balance: number;
}
