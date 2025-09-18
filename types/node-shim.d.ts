declare module 'crypto' {
  export function randomUUID(): string;
}

declare module 'fs' {
  export const promises: {
    readFile(path: string, options?: { encoding?: string } | string): Promise<string>;
    writeFile(path: string, data: string, options?: { encoding?: string } | string): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    unlink(path: string): Promise<void>;
  };
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function isAbsolute(path: string): boolean;
}

declare module 'os' {
  export function tmpdir(): string;
}

declare module 'http' {
  export interface IncomingMessage {
    headers: Record<string, string | string[] | undefined>;
    method?: string;
    url?: string;
    [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>;
  }

  export interface ServerResponse {
    statusCode: number;
    setHeader(name: string, value: string | number | ReadonlyArray<string>): void;
    getHeader(name: string): string | number | string[] | undefined;
    end(data?: unknown): void;
  }

  export function createServer(
    listener: (
      request: IncomingMessage,
      response: ServerResponse
    ) => void | Promise<void>
  ): { listen(port: number, callback?: () => void): void };
}

declare module 'url' {
  export class URL {
    constructor(input: string, base?: string | URL);
    readonly pathname: string;
    readonly searchParams: {
      entries(): IterableIterator<[string, string]>;
    };
  }
}

declare namespace NodeJS {
  interface ErrnoException extends Error {
    code?: string;
  }
}

declare const process: {
  cwd(): string;
  env: Record<string, string | undefined>;
};

declare class Buffer extends Uint8Array {
  static concat(list: Buffer[]): Buffer;
  static from(data: string | ArrayBufferView): Buffer;
}
