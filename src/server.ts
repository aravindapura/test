import http from 'node:http';
import { FinanceService } from './services/FinanceService';
import { createFinanceHandler } from './http/financeHandler';

const service = new FinanceService();
const handler = createFinanceHandler(service);
const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer((req, res) => {
  void handler(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер учета финансов запущен на порту ${PORT}`);
  console.log('Доступные маршруты:');
  console.log('GET    /transactions — список операций');
  console.log('POST   /transactions — создание операции');
  console.log('DELETE /transactions/:id — удаление операции');
  console.log('GET    /summary — финансовая сводка');
});
