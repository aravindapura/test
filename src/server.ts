import http, { IncomingMessage, ServerResponse } from 'node:http';
import { FinanceService } from './services/FinanceService';
import { CreateTransactionDto } from './models/Transaction';
import { readJsonBody, sendError, sendJson } from './utils/http';

const service = new FinanceService();
const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
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

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/transactions') {
      const transactions = await service.listTransactions();
      sendJson(res, 200, transactions);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/transactions') {
      const payload = (await readJsonBody<CreateTransactionDto>(req)) ?? {};
      const created = await service.createTransaction(payload);
      sendJson(res, 201, created);
      return;
    }

    if (req.method === 'DELETE' && url.pathname.startsWith('/transactions/')) {
      const id = url.pathname.replace('/transactions/', '').trim();
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

    if (req.method === 'GET' && url.pathname === '/summary') {
      const summary = await service.getSummary();
      sendJson(res, 200, summary);
      return;
    }

    sendError(res, 404, 'Маршрут не найден.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка сервера.';
    sendError(res, 400, message);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер учета финансов запущен на порту ${PORT}`);
  console.log('Доступные маршруты:');
  console.log('GET    /transactions — список операций');
  console.log('POST   /transactions — создание операции');
  console.log('DELETE /transactions/:id — удаление операции');
  console.log('GET    /summary — финансовая сводка');
});
