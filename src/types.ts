export type TransactionType = 'income' | 'expense';

export interface TransactionPayload {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  type: TransactionType;
}

export interface SummaryEntry {
  category: string;
  total: number;
}
