import { randomUUID } from 'crypto';
import { loadTransactions, saveTransactions } from './storage.js';
import { SummaryEntry, Transaction, TransactionType } from './types.js';

export interface TransactionPayload {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number.');
  }
}

function normalizeCategory(category: string): string {
  const trimmed = category.trim();
  if (!trimmed) {
    throw new Error('Category must not be empty.');
  }
  return trimmed.toLowerCase();
}

export class FinanceTracker {
  private transactions: Transaction[] = [];

  private constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  static async init(): Promise<FinanceTracker> {
    const existing = await loadTransactions();
    return new FinanceTracker(existing);
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getBalance(): number {
    return this.transactions.reduce((balance, transaction) => {
      return transaction.type === 'income'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  }

  getSummaryByCategory(): SummaryEntry[] {
    const summaryMap = new Map<string, number>();
    for (const transaction of this.transactions) {
      const signedAmount = transaction.type === 'income' ? transaction.amount : -transaction.amount;
      summaryMap.set(transaction.category, (summaryMap.get(transaction.category) ?? 0) + signedAmount);
    }

    return Array.from(summaryMap.entries()).map(([category, total]) => ({ category, total }));
  }

  async addIncome(payload: TransactionPayload): Promise<Transaction> {
    return this.addTransaction(payload, 'income');
  }

  async addExpense(payload: TransactionPayload): Promise<Transaction> {
    return this.addTransaction(payload, 'expense');
  }

  private async addTransaction(payload: TransactionPayload, type: TransactionType): Promise<Transaction> {
    validateAmount(payload.amount);
    const category = normalizeCategory(payload.category);
    const transaction: Transaction = {
      id: randomUUID(),
      amount: Number(payload.amount),
      category,
      description: payload.description?.trim() || undefined,
      date: payload.date ?? new Date().toISOString(),
      type,
    };
    this.transactions.push(transaction);
    await saveTransactions(this.transactions);
    return transaction;
  }
}
