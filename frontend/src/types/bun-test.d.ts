/* eslint-disable @typescript-eslint/no-unused-vars */

declare module "bun:test" {
  export interface TestFn {
    (name: string, fn: () => void | Promise<void>): void;
    skip(name: string, fn: () => void | Promise<void>): void;
  }

  export function describe(name: string, fn: () => void): void;
  export const test: TestFn;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;

  export function mock<TArgs extends unknown[], TReturn>(
    fn: (...args: TArgs) => TReturn
  ): ((...args: TArgs) => TReturn) & {
    mock: {
      calls: TArgs[];
      results: { type: "return" | "throw"; value: unknown }[];
    };
  };

  export interface Matchers<R = void> {
    toBe(expected: unknown): R;
    toEqual(expected: unknown): R;
    toStrictEqual(expected: unknown): R;
    toBeTruthy(): R;
    toBeFalsy(): R;
    toBeNull(): R;
    toBeUndefined(): R;
    toBeDefined(): R;
    toBeNaN(): R;
    toBeGreaterThan(expected: number): R;
    toBeLessThan(expected: number): R;
    toBeCloseTo(expected: number, precision?: number): R;
    toContain(expected: unknown): R;
    toHaveLength(expected: number): R;
    toMatch(expected: string | RegExp): R;
    toThrow(expected?: string | RegExp): R;
    toHaveBeenCalled(): R;
    toHaveBeenCalledTimes(expected: number): R;
    toHaveBeenCalledWith(...args: unknown[]): R;
    toMatchTypeOf<T>(): R;
    toHaveProperty(property: string): R;
    toMatchObject(expected: Record<string, unknown>): R;
    resolves: Matchers<Promise<R>>;
    rejects: Matchers<Promise<R>>;
    not: Matchers<R>;
  }

  export function expect<T>(actual: T): Matchers;

  export function expectTypeOf<T>(actual?: T): {
    toMatchTypeOf<Expected>(): void;
    toEqualTypeOf<Expected>(): void;
    toHaveProperty(property: string): void;
  };
}
