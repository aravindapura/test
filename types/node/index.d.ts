interface Buffer extends Uint8Array {
  toString(encoding?: string): string;
}

declare const Buffer: {
  from(data: string | ArrayBuffer | ArrayBufferView | Buffer): Buffer;
  isBuffer(data: unknown): data is Buffer;
  concat(buffers: Buffer[], totalLength?: number): Buffer;
};

declare const process: {
  env: Record<string, string | undefined>;
  cwd(): string;
};

declare module 'node:http' {
  type HeaderValue = string | string[] | undefined;

  interface IncomingMessage extends AsyncIterable<Buffer> {
    headers: Record<string, HeaderValue>;
    method?: string;
    url?: string | null;
  }

  interface ServerResponse {
    setHeader(name: string, value: string): void;
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    end(data?: string | Buffer): void;
    statusCode: number;
  }

  type RequestListener = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

  interface Server {
    listen(port: number, callback?: () => void): void;
  }

  export function createServer(listener: RequestListener): Server;

  const defaultExport: {
    createServer: typeof createServer;
  };

  export { IncomingMessage, ServerResponse, Server, RequestListener };
  export default defaultExport;
}

declare module 'node:crypto' {
  export function randomUUID(): string;
}

declare module 'node:fs' {
  interface MkdirOptions {
    recursive?: boolean;
  }

  export const promises: {
    readFile(path: string, encoding: string): Promise<string>;
    writeFile(path: string, data: string, encoding: string): Promise<void>;
    mkdir(path: string, options?: MkdirOptions): Promise<void>;
  };
}

declare module 'node:path' {
  export function join(...segments: string[]): string;
  export function dirname(path: string): string;
}
