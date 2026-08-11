import http from 'http';
import { URL } from 'url';
import handler from '../api/transactions.js';
import type { VercelRequest, VercelResponse } from '../src/vercel-types.js';

const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Bad request');
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname !== '/api/transactions') {
    res.statusCode = 404;
    res.end('Not Found');
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const rawBody = Buffer.concat(chunks);

  let parsedBody: unknown = undefined;
  if (rawBody.length > 0) {
    try {
      parsedBody = JSON.parse(rawBody.toString());
    } catch (error) {
      res.statusCode = 400;
      res.end('Invalid JSON body');
      return;
    }
  }

  const request = Object.assign(req, {
    query: Object.fromEntries(url.searchParams.entries()),
    body: parsedBody,
    rawBody,
  }) as VercelRequest;

  const response = createResponse(res);
  await handler(request, response);
});

server.listen(PORT, () => {
  console.log(`Local dev server listening on http://localhost:${PORT}/api/transactions`);
});

function createResponse(res: http.ServerResponse): VercelResponse {
  const api = {
    status(code: number) {
      res.statusCode = code;
      return api;
    },
    json(payload: unknown) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json');
      }
      res.end(JSON.stringify(payload));
      return api;
    },
    send(payload: unknown) {
      if (typeof payload === 'object') {
        if (!res.getHeader('Content-Type')) {
          res.setHeader('Content-Type', 'application/json');
        }
        res.end(JSON.stringify(payload));
      } else {
        res.end(String(payload));
      }
      return api;
    },
    setHeader(name: string, value: number | string | ReadonlyArray<string>) {
      res.setHeader(name, value);
      return api;
    },
    getHeader(name: string) {
      return res.getHeader(name);
    },
    end(payload?: any) {
      res.end(payload);
      return api;
    },
  } as VercelResponse & {
    status: (code: number) => VercelResponse;
    json: (payload: unknown) => VercelResponse;
    send: (payload: unknown) => VercelResponse;
  };

  return api;
}
