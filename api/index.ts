/// <reference path="../types/node/index.d.ts" />
import type { IncomingMessage, ServerResponse } from 'node:http';
import { FinanceService } from '../src/services/FinanceService';
import { createFinanceHandler } from '../src/http/financeHandler';

const handler = createFinanceHandler(new FinanceService(), { basePath: '/api' });

export default async function handlerEntry(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await handler(req, res);
}
