import { catchAsUndefined } from "./internal";
import { parseDateLike, parseTimeLike } from "./parse";
import type { DateLike, TimeLike } from "./types";

/**
 * Creates a JSON.parse reviver for parsing a date or time values
 */

// biome-ignore lint/suspicious/noExplicitAny: as defined by JSON.parse
type JsonReviver = (key: string, value: any) => any;

function temporalReviver(
  parseFn: (s: string) => DateLike | TimeLike | undefined,
  keys?: string[],
): JsonReviver {
  const keySet = keys ? new Set(keys) : null;
  const includeInts = keySet?.has("") ?? false;

  // biome-ignore lint/suspicious/noExplicitAny: as defined by JSON.parse
  return (key: string, value: any) => {
    if (
      typeof value === "string" &&
      (!keySet || keySet.has(key) || (includeInts && /^\d+$/.test(key)))
    ) {
      return parseFn(value) ?? value;
    }
    return value;
  };
}

const safeParseDateLike = catchAsUndefined(parseDateLike);
const safeParseTimeLike = catchAsUndefined(parseTimeLike);

/**
 *
 * Creates a JSON.parse reviver for parsing values with a date component
 *
 * Usage: JSON.parse(jsonStr, dateLikeReviver(["createdAt", "updatedAt"]))
 */

export function dateLikeReviver(keys?: string[]) {
  return temporalReviver(safeParseDateLike, keys);
}

/**
 *
 * Creates a JSON.parse reviver for parsing values with a time component
 *
 * Usage: JSON.parse(jsonStr, timeLikeReviver(["startTime", "endTime"]))
 */
export function timeLikeReviver(keys?: string[]) {
  return temporalReviver(safeParseTimeLike, keys);
}

// ============= CONVENIENCE JSON PARSE FUNCTIONS =============

/**
 * Parses JSON with automatic DateLike conversion
 * @param text The JSON string to parse
 * @param keys Optional array of keys to parse. If not provided, parses all string values.
 */
export function jsonParseDateLike(text: string, keys?: string[]) {
  return JSON.parse(text, dateLikeReviver(keys));
}

/**
 * Parses JSON with automatic TimeLike conversion
 * @param text The JSON string to parse
 * @param keys Optional array of keys to parse. If not provided, parses all string values.
 */
export function jsonParseTimeLike(text: string, keys?: string[]) {
  return JSON.parse(text, timeLikeReviver(keys));
}
