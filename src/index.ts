import { createServer, IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import { resolve, dirname } from 'path';
import { randomUUID } from 'crypto';

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category?: string;
}

interface TransactionInput {
  description: unknown;
  amount: unknown;
  type: unknown;
  date?: unknown;
  category?: unknown;
}

interface Summary {
  income: number;
  expense: number;
  balance: number;
}

class Ledger {
  private constructor(
    private readonly filePath: string,
    private transactions: Transaction[]
  ) {}

  public static async initialize(filePath: string): Promise<Ledger> {
    await fs.mkdir(dirname(filePath), { recursive: true });

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as Transaction[];
      return new Ledger(filePath, parsed);
    } catch (error) {
      return new Ledger(filePath, []);
    }
  }

  public list(type?: TransactionType): Transaction[] {
    if (!type) {
      return [...this.transactions].sort((a, b) => b.date.localeCompare(a.date));
    }

    return this.transactions
      .filter((transaction) => transaction.type === type)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  public add(input: TransactionInput): Transaction {
    const transaction = this.validateTransaction(input);
    this.transactions.push(transaction);
    this.transactions.sort((a, b) => b.date.localeCompare(a.date));
    void this.persist();
    return transaction;
  }

  public summary(): Summary {
    return this.transactions.reduce<Summary>(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += transaction.amount;
        } else {
          accumulator.expense += transaction.amount;
        }

        accumulator.balance = accumulator.income - accumulator.expense;
        return accumulator;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }

  private validateTransaction(input: TransactionInput): Transaction {
    const description = this.assertString(input.description, 'description');
    const amount = this.assertPositiveNumber(input.amount, 'amount');
    const type = this.assertTransactionType(input.type);
    const category = this.optionalString(input.category);
    const isoDate = this.assertDate(input.date);

    return {
      id: randomUUID(),
      description,
      amount,
      type,
      date: isoDate,
      category,
    };
  }

  private assertString(value: unknown, field: string): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    throw new Error(`Field "${field}" must be a non-empty string.`);
  }

  private optionalString(value: unknown): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    throw new Error('Optional field "category" must be a non-empty string when provided.');
  }

  private assertPositiveNumber(value: unknown, field: string): number {
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
      throw new Error(`Field "${field}" must be a valid number.`);
    }

    if (value <= 0) {
      throw new Error(`Field "${field}" must be greater than zero.`);
    }

    return Math.round(value * 100) / 100;
  }

  private assertTransactionType(value: unknown): TransactionType {
    if (value === 'income' || value === 'expense') {
      return value;
    }

    throw new Error('Field "type" must be either "income" or "expense".');
  }

  private assertDate(value: unknown): string {
    if (value === undefined || value === null) {
      return new Date().toISOString();
    }

    if (typeof value === 'string') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    throw new Error('Field "date" must be a valid ISO date string.');
  }

  private async persist(): Promise<void> {
    await fs.writeFile(this.filePath, JSON.stringify(this.transactions, null, 2), {
      encoding: 'utf-8',
    });
  }
}

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

type RouteDefinition = {
  method: string;
  path: string;
  handler: RouteHandler;
};

const DATA_FILE = resolve(__dirname, '../data/transactions.json');
const PORT = Number(process.env.PORT) || 3000;

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    let body = '';

    if (typeof (req as any).setEncoding === 'function') {
      (req as any).setEncoding('utf-8');
    }

    req.on('data', (chunk: string) => {
      body += chunk;
    });

    req.on('end', () => {
      resolvePromise(body);
    });

    req.on('error', (error: Error) => {
      rejectPromise(error);
    });
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

function handleOptions(res: ServerResponse): void {
  res.statusCode = 204;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end();
}

function notFound(res: ServerResponse): void {
  sendJson(res, 404, { message: 'Resource not found.' });
}

async function bootstrap(): Promise<void> {
  const ledger = await Ledger.initialize(DATA_FILE);

  const routes: RouteDefinition[] = [
    {
      method: 'GET',
      path: '/transactions',
      handler: async (_req, res) => {
        const url = new URL(_req.url ?? '', 'http://localhost');
        const type = url.searchParams.get('type');
        const validType = type === 'income' || type === 'expense' ? (type as TransactionType) : undefined;
        const transactions = ledger.list(validType);
        sendJson(res, 200, { data: transactions });
      },
    },
    {
      method: 'POST',
      path: '/transactions',
      handler: async (req, res) => {
        const rawBody = await readBody(req);

        if (!rawBody) {
          sendJson(res, 400, { message: 'Request body is required.' });
          return;
        }

        try {
          const parsedBody = JSON.parse(rawBody) as TransactionInput;
          const created = ledger.add(parsedBody);
          sendJson(res, 201, { data: created });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to create transaction.';
          sendJson(res, 400, { message });
        }
      },
    },
    {
      method: 'GET',
      path: '/summary',
      handler: async (_req, res) => {
        const summary = ledger.summary();
        sendJson(res, 200, { data: summary });
      },
    },
  ];

  const server = createServer(async (req, res) => {
    if (!req.url || !req.method) {
      sendJson(res, 400, { message: 'Invalid request.' });
      return;
    }

    if (req.method === 'OPTIONS') {
      handleOptions(res);
      return;
    }

    const url = new URL(req.url, 'http://localhost');

    const route = routes.find((definition) => definition.method === req.method && definition.path === url.pathname);

    if (!route) {
      notFound(res);
      return;
    }

    try {
      await route.handler(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      sendJson(res, 500, { message });
    }
  });

  server.listen(PORT, () => {
    console.log(`Ledger server is running on http://localhost:${PORT}`);
  });
}

void bootstrap();
