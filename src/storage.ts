import { promises as fs } from 'fs';
import path from 'path';
import { Transaction } from './types.js';

const DEFAULT_FILE = path.join(process.cwd(), 'data', 'finance-data.json');

function resolveDataFilePath(): string {
  const customPath = process.env.DATA_FILE_PATH;
  if (customPath && customPath.trim().length > 0) {
    return path.isAbsolute(customPath) ? customPath : path.join(process.cwd(), customPath);
  }
  return DEFAULT_FILE;
}

export async function loadTransactions(): Promise<Transaction[]> {
  const filePath = resolveDataFilePath();
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed: Transaction[] = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  const filePath = resolveDataFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(transactions, null, 2), 'utf-8');
}
