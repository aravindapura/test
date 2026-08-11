import { CreateTransactionDto, Summary, Transaction } from '../models/Transaction';
import { FileDatabase } from '../storage/FileDatabase';

export class FinanceService {
  constructor(private readonly database: FileDatabase = new FileDatabase()) {}

  public async listTransactions(): Promise<Transaction[]> {
    return this.database.listTransactions();
  }

  public async createTransaction(input: CreateTransactionDto): Promise<Transaction> {
    const payload = this.validateCreatePayload(input);
    return this.database.addTransaction(payload);
  }

  public async removeTransaction(id: string): Promise<boolean> {
    if (!id || typeof id !== 'string') {
      throw new Error('Идентификатор операции обязателен.');
    }

    return this.database.deleteTransaction(id);
  }

  public async getSummary(): Promise<Summary> {
    const transactions = await this.database.listTransactions();

    const summary: Summary = {
      incomeTotal: 0,
      expenseTotal: 0,
      balance: 0,
      byCategory: {},
    };

    for (const transaction of transactions) {
      const amount = Number(transaction.amount);
      if (transaction.type === 'income') {
        summary.incomeTotal += amount;
      } else {
        summary.expenseTotal += amount;
      }

      const categoryKey = transaction.category;
      if (!summary.byCategory[categoryKey]) {
        summary.byCategory[categoryKey] = { income: 0, expense: 0, balance: 0 };
      }

      if (transaction.type === 'income') {
        summary.byCategory[categoryKey].income += amount;
      } else {
        summary.byCategory[categoryKey].expense += amount;
      }

      summary.byCategory[categoryKey].balance =
        summary.byCategory[categoryKey].income - summary.byCategory[categoryKey].expense;
    }

    for (const categorySummary of Object.values(summary.byCategory)) {
      categorySummary.income = Number(categorySummary.income.toFixed(2));
      categorySummary.expense = Number(categorySummary.expense.toFixed(2));
      categorySummary.balance = Number(categorySummary.balance.toFixed(2));
    }

    summary.incomeTotal = Number(summary.incomeTotal.toFixed(2));
    summary.expenseTotal = Number(summary.expenseTotal.toFixed(2));
    summary.balance = Number((summary.incomeTotal - summary.expenseTotal).toFixed(2));

    return summary;
  }

  private validateCreatePayload(input: CreateTransactionDto): CreateTransactionDto {
    if (!input) {
      throw new Error('Данные операции не переданы.');
    }

    const type = input.type;
    if (type !== 'income' && type !== 'expense') {
      throw new Error('Тип операции должен быть "income" или "expense".');
    }

    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Сумма должна быть числом больше нуля.');
    }

    const category = input.category?.trim();
    if (!category) {
      throw new Error('Категория обязательна.');
    }

    let date: string | undefined;
    if (input.date) {
      const parsed = new Date(input.date);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Дата операции указана неверно.');
      }
      date = parsed.toISOString();
    }

    return {
      type,
      amount,
      category,
      description: input.description?.trim() || undefined,
      date,
    };
  }
}
