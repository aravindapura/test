import { IncomingMessage, ServerResponse } from 'node:http';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
};

export async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {} as T;
  }

  const raw = Buffer.concat(chunks).toString('utf-8');
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error('Не удалось прочитать тело запроса. Убедитесь, что передан корректный JSON.');
  }
}

export function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, DEFAULT_HEADERS);
  res.end(body);
}

export function sendError(res: ServerResponse, statusCode: number, message: string): void {
  sendJson(res, statusCode, {
    error: message,
  });
}
