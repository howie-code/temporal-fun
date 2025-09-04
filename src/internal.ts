import {
  parseDate,
  parseDateLike,
  parseDateTime,
  parseInstant,
  parseTime,
  parseTimeLike,
  parseZoned,
} from "./parse";

export type IsUnion<T, U = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : never;
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
