import { z } from 'zod';
import { FinanceTracker } from '../src/financeTracker.js';
import type { VercelRequest, VercelResponse } from '../src/vercel-types.js';

const transactionSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  type: z.enum(['income', 'expense']).default('expense'),
});

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
    const payload = transactionSchema.parse(body);
    const tracker = await FinanceTracker.init();
    const transaction =
      payload.type === 'income'
        ? await tracker.addIncome(payload)
        : await tracker.addExpense(payload);

    setCorsHeaders(response);
    return response.status(201).json(transaction);
  } catch (error) {
    setCorsHeaders(response);
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: 'Invalid request body', details: error.flatten() });
    }

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

function setCorsHeaders(response: VercelResponse) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
