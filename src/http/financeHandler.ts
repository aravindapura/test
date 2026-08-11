import type { IncomingMessage, ServerResponse } from 'node:http';
import { FinanceService } from '../services/FinanceService';
import type { CreateTransactionDto } from '../models/Transaction';
import { readJsonBody, sendError, sendJson } from '../utils/http';

interface HandlerOptions {
  /**
   * Базовый путь, который следует отбросить перед обработкой маршрутов.
   * Например, для Vercel все запросы приходят на `/api/...`.
   */
  basePath?: string;
}

function normalizeBasePath(pathname: string | undefined): string {
  if (!pathname) {
    return '';
  }
  if (pathname === '/') {
    return '';
  }
  return pathname.replace(/\/$/, '');
}

function normalizeRoutePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }
  return pathname.replace(/\/+$/u, '') || '/';
}

export function createFinanceHandler(
  service: FinanceService = new FinanceService(),
  options: HandlerOptions = {},
) {
  const basePath = normalizeBasePath(options.basePath);

  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (!req.url) {
      sendError(res, 400, 'Некорректный URL.');
      return;
    }

    const requestUrl = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    let pathname = requestUrl.pathname;

    if (basePath && pathname.startsWith(basePath)) {
      pathname = pathname.slice(basePath.length);
    }

    pathname = normalizeRoutePath(pathname);

    try {
      if (req.method === 'GET' && pathname === '/transactions') {
        const transactions = await service.listTransactions();
        sendJson(res, 200, transactions);
        return;
      }

      if (req.method === 'POST' && pathname === '/transactions') {
        const payload = (await readJsonBody<CreateTransactionDto>(req)) ?? {};
        const created = await service.createTransaction(payload);
        sendJson(res, 201, created);
        return;
      }

      if (req.method === 'DELETE' && pathname.startsWith('/transactions/')) {
        const id = pathname.replace('/transactions/', '').trim();
        if (!id) {
          sendError(res, 400, 'Не передан идентификатор операции.');
          return;
        }

        const deleted = await service.removeTransaction(id);
        if (!deleted) {
          sendError(res, 404, 'Операция не найдена.');
          return;
        }

        sendJson(res, 200, { success: true });
        return;
      }

      if (req.method === 'GET' && pathname === '/summary') {
        const summary = await service.getSummary();
        sendJson(res, 200, summary);
        return;
      }

      sendError(res, 404, 'Маршрут не найден.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка сервера.';
      sendError(res, 400, message);
    }
  };
}
