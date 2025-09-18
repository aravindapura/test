import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { FinanceTracker } from '../src/financeTracker.js';

const TEST_FILE = path.join(tmpdir(), 'finance-tracker-test.json');

beforeEach(async () => {
  process.env.DATA_FILE_PATH = TEST_FILE;
  try {
    await fs.unlink(TEST_FILE);
  } catch {
    // ignore
  }
});

afterEach(async () => {
  try {
    await fs.unlink(TEST_FILE);
  } catch {
    // ignore
  }
});

describe('FinanceTracker', () => {
  test('adds income and expense transactions and persists them', async () => {
    const tracker = await FinanceTracker.init();
    await tracker.addIncome({ amount: 1000, category: 'Salary', description: 'Monthly pay' });
    await tracker.addExpense({ amount: 200, category: 'Food', description: 'Groceries' });

    const transactions = tracker.getTransactions();
    expect(transactions).toHaveLength(2);

    const reloaded = await FinanceTracker.init();
    expect(reloaded.getTransactions()).toHaveLength(2);
    expect(reloaded.getBalance()).toBe(800);
  });

  test('summarizes totals per category using signed amounts', async () => {
    const tracker = await FinanceTracker.init();
    await tracker.addIncome({ amount: 500, category: 'Salary' });
    await tracker.addIncome({ amount: 200, category: 'salary' });
    await tracker.addExpense({ amount: 100, category: 'Food' });

    const summary = tracker.getSummaryByCategory();
    const salaryEntry = summary.find((entry) => entry.category === 'salary');
    const foodEntry = summary.find((entry) => entry.category === 'food');

    expect(salaryEntry?.total).toBe(700);
    expect(foodEntry?.total).toBe(-100);
  });

  test('rejects invalid data', async () => {
    const tracker = await FinanceTracker.init();

    await expect(tracker.addIncome({ amount: -10, category: 'bonus' })).rejects.toThrow('Amount must be a positive number.');
    await expect(tracker.addExpense({ amount: 10, category: '   ' })).rejects.toThrow('Category must not be empty.');
  });
});
