import { FinanceTracker } from '../src/financeTracker.js';
import type { VercelRequest, VercelResponse } from '../src/vercel-types.js';
import type { TransactionPayload, TransactionType } from '../src/types.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'OPTIONS') {
    setCorsHeaders(response);
    return response.status(204).send('');
  }

  if (request.method === 'GET') {
    return handleGet(response);
  }

  if (request.method === 'POST') {
    return handlePost(request, response);
  }

  setCorsHeaders(response);
  return response.status(405).json({ error: 'Method not allowed' });
}

async function handleGet(response: VercelResponse) {
  const tracker = await FinanceTracker.init();
  const transactions = tracker.getTransactions();
  const balance = tracker.getBalance();
  const summary = tracker.getSummaryByCategory();

  setCorsHeaders(response);
  return response.status(200).json({ transactions, balance, summary });
}

async function handlePost(request: VercelRequest, response: VercelResponse) {
  try {
    const body = parseBody(request);
    const { transactionType, payload } = validatePayload(body);
    const tracker = await FinanceTracker.init();
    const transaction =
      transactionType === 'income'
        ? await tracker.addIncome(payload)
        : await tracker.addExpense(payload);

    setCorsHeaders(response);
    return response.status(201).json(transaction);
  } catch (error) {
    setCorsHeaders(response);
    if (error instanceof Error) {
      return response.status(400).json({ error: error.message });
    }

    return response.status(500).json({ error: 'Unexpected error' });
  }
}

function parseBody(request: VercelRequest): unknown {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const rawBody = typeof request.body === 'string' ? request.body : request.rawBody?.toString();
  if (rawBody && rawBody.length > 0) {
    return JSON.parse(rawBody);
  }

  return {};
}

function validatePayload(data: unknown): { transactionType: TransactionType; payload: TransactionPayload } {
  if (!data || typeof data !== 'object') {
    throw new Error('Request body must be an object.');
  }

  const record = data as Record<string, unknown>;
  const amount = record.amount;
  const category = record.category;
  const description = record.description;
  const date = record.date;
  const type = record.type;

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new Error('Amount must be a positive number.');
  }

  if (typeof category !== 'string' || category.trim().length === 0) {
    throw new Error('Category must not be empty.');
  }

  if (description != null && typeof description !== 'string') {
    throw new Error('Description must be a string.');
  }

  if (date != null && typeof date !== 'string') {
    throw new Error('Date must be a string.');
  }

  let transactionType: TransactionType = 'expense';
  if (type != null) {
    if (type === 'income' || type === 'expense') {
      transactionType = type;
    } else {
      throw new Error('Type must be either "income" or "expense".');
    }
  }

  const payload: TransactionPayload = {
    amount,
    category,
    description: description ?? undefined,
    date: date ?? undefined,
  };

  return { transactionType, payload };
}

function setCorsHeaders(response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
