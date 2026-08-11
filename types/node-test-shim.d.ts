declare module 'node:test' {
  export function test(name: string, fn: () => void | Promise<void>): void;
  export function describe(name: string, fn: () => void): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): asserts value;
    ok(value: unknown, message?: string): asserts value;
    strictEqual(actual: unknown, expected: unknown, message?: string): void;
    deepStrictEqual(actual: unknown, expected: unknown, message?: string): void;
    rejects(block: (() => Promise<unknown>) | Promise<unknown>, error?: RegExp | ((error: unknown) => boolean) | { message?: string | RegExp }): Promise<void>;
  }

  const assert: Assert;
  export default assert;
  export const ok: Assert['ok'];
  export const strictEqual: Assert['strictEqual'];
  export const deepStrictEqual: Assert['deepStrictEqual'];
  export const rejects: Assert['rejects'];
}
