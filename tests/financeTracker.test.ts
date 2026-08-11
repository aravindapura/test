import { afterEach, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
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
    // ignore missing file
  }
});

afterEach(async () => {
  try {
    await fs.unlink(TEST_FILE);
  } catch {
    // ignore missing file
  }
});

describe('FinanceTracker', () => {
  test('adds income and expense transactions and persists them', async () => {
    const tracker = await FinanceTracker.init();
    await tracker.addIncome({ amount: 1000, category: 'Salary', description: 'Monthly pay' });
    await tracker.addExpense({ amount: 200, category: 'Food', description: 'Groceries' });

    const transactions = tracker.getTransactions();
    assert.strictEqual(transactions.length, 2);

    const reloaded = await FinanceTracker.init();
    assert.strictEqual(reloaded.getTransactions().length, 2);
    assert.strictEqual(reloaded.getBalance(), 800);
  });

  test('summarizes totals per category using signed amounts', async () => {
    const tracker = await FinanceTracker.init();
    await tracker.addIncome({ amount: 500, category: 'Salary' });
    await tracker.addIncome({ amount: 200, category: 'salary' });
    await tracker.addExpense({ amount: 100, category: 'Food' });

    const summary = tracker.getSummaryByCategory();
    const salaryEntry = summary.find((entry) => entry.category === 'salary');
    const foodEntry = summary.find((entry) => entry.category === 'food');

    assert.ok(salaryEntry, 'Salary entry should be present');
    assert.strictEqual(salaryEntry!.total, 700);
    assert.ok(foodEntry, 'Food entry should be present');
    assert.strictEqual(foodEntry!.total, -100);
  });

  test('rejects invalid data', async () => {
    const tracker = await FinanceTracker.init();

    await assert.rejects(tracker.addIncome({ amount: -10, category: 'bonus' }), /Amount must be a positive number\./);
    await assert.rejects(tracker.addExpense({ amount: 10, category: '   ' }), /Category must not be empty\./);
  });
});
