import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CreateTransactionDto, Transaction } from '../models/Transaction';

interface DatabaseSchema {
  transactions: Transaction[];
}

const DEFAULT_DATA: DatabaseSchema = {
  transactions: [],
};

export class FileDatabase {
  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.join(process.cwd(), 'data', 'finance-db.json');
  }

  public async listTransactions(): Promise<Transaction[]> {
    const data = await this.readData();
    return data.transactions;
  }

  public async addTransaction(input: CreateTransactionDto): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      description: input.description?.trim() || undefined,
      createdAt: input.date ? new Date(input.date).toISOString() : new Date().toISOString(),
    };

    const data = await this.readData();
    data.transactions.push(transaction);
    await this.writeData(data);

    return transaction;
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    const data = await this.readData();
    const index = data.transactions.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }

    data.transactions.splice(index, 1);
    await this.writeData(data);
    return true;
  }

  private async readData(): Promise<DatabaseSchema> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw) as DatabaseSchema;
      if (!Array.isArray(parsed.transactions)) {
        return { ...DEFAULT_DATA };
      }
      return parsed;
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        await this.writeData({ ...DEFAULT_DATA });
        return { ...DEFAULT_DATA };
      }
      throw error;
    }
  }

  private async writeData(data: DatabaseSchema): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

type NodeLikeError = Error & { code?: string };

function isNodeError(error: unknown): error is NodeLikeError {
  return error instanceof Error && typeof (error as NodeLikeError).code === 'string';
}
