import type { IncomingMessage, ServerResponse } from 'http';

export type VercelRequest = IncomingMessage & {
  body?: unknown;
  rawBody?: Buffer;
  query: Record<string, string>;
};

export type VercelResponse = ServerResponse & {
  status(code: number): VercelResponse;
  json(data: unknown): VercelResponse;
  send(data: unknown): VercelResponse;
};
