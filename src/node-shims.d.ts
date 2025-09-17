declare module 'http' {
  export type IncomingMessage = any;
  export type ServerResponse = any;
  export function createServer(
    requestListener: (req: IncomingMessage, res: ServerResponse) => void
  ): {
    listen(port: number, callback?: () => void): void;
  };
}

declare module 'fs' {
  export const promises: {
    readFile(path: string, encoding: string): Promise<string>;
    writeFile(path: string, data: string, options?: { encoding?: string }): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
    access(path: string): Promise<void>;
  };
}

declare module 'path' {
  export function resolve(...paths: string[]): string;
  export function dirname(path: string): string;
  export function join(...paths: string[]): string;
}

declare module 'crypto' {
  export function randomUUID(): string;
}

declare const process: {
  env: Record<string, string | undefined>;
};

declare const __dirname: string;
