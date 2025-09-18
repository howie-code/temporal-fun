import type { DateLike } from "./types";

export type IsUnion<T, U = T> = T extends unknown ? ([U] extends [T] ? false : true) : never;
export type Concrete<T> = IsUnion<T> extends true ? never : T;

/**
 * Helper to catch errors and return undefined for safe parsing
 */
export function catchAsUndefined<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
): (...args: Args) => T | undefined {
  return (...args: Args) => {
    try {
      return fn(...args);
    } catch {
      return undefined;
    }
  };
}

export const safeParse = <T>(parseFn: (str: string) => T, str: string) =>
  catchAsUndefined<T, [string]>(parseFn)(str);

export function constructorName(value: unknown): string {
  // biome-ignore lint/suspicious/noExplicitAny: dynamic use of constructor for any Temporal type
  return (!!value && (value as any)?.constructor?.name) || null;
}

export function uncheckedCompare(a: DateLike, b: DateLike): number {
  // biome-ignore lint/suspicious/noExplicitAny: dynamically use different Temporal constructors
  return (a.constructor as any).compare(a, b);
}
