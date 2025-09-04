import {
  DateLike,
  WeekStartsOn,
  PlainDate,
  PlainDateTime,
  Zoned,
  Instant,
} from "./types.js";
import { startOfWeek } from "./math.js";
import { date } from "./convert.js";
import { isDate } from "./guards.js";
import * as config from "./config.js";
import { Concrete } from "./internal.js";

/**
 * Compares two DateLike objects using their constructor's compare method
 */
export function compare<T extends DateLike>(
  a: Concrete<T>,
  b: Concrete<T>,
): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const constructor = a.constructor as any;
  return constructor.compare(a, b);
}

/**
 * Returns true if the first date is before the second date
 */
export function isBefore<T extends DateLike>(
  a: Concrete<T>,
  b: Concrete<T>,
): boolean {
  return compare(a, b) < 0;
}

/**
 * Returns true if the first date is equal to or before the second date
 */
export function isEqualOrBefore<T extends DateLike>(
  a: Concrete<T>,
  b: Concrete<T>,
): boolean {
  return compare(a, b) <= 0;
}

/**
 * Returns true if the first date is after the second date
 */
export function isAfter<T extends DateLike>(
  a: Concrete<T>,
  b: Concrete<T>,
): boolean {
  return compare(a, b) > 0;
}

/**
 * Returns true if the first date is equal to or after the second date
 */
export function isEqualOrAfter<T extends DateLike>(
  a: Concrete<T>,
  b: Concrete<T>,
): boolean {
  return compare(a, b) >= 0;
}

/**
 * Returns true if both dates are the same day
 * Works with any DateLike types - Instant is treated as UTC
 */
export function isSameDay(a: DateLike, b: DateLike): boolean {
  const dateA = date(a);
  const dateB = date(b);
  return PlainDate.compare(dateA, dateB) === 0;
}

/**
 * Returns true if both dates are in the same week
 * Works with any DateLike types - Instant is treated as UTC
 */
export function isSameWeek(
  a: DateLike,
  b: DateLike,
  weekStartsOn?: WeekStartsOn,
): boolean {
  const weekStart = weekStartsOn ?? config.getWeekStart();
  const startOfWeekA = startOfWeek(a, weekStart);
  const startOfWeekB = startOfWeek(b, weekStart);
  return isSameDay(startOfWeekA, startOfWeekB);
}

/**
 * Returns true if two ranges overlap
 *
 * Optionally specify "inclusive" to indicate if end-matching-start is an overlap
 * By default:
 * - PlainDate uses inclusive overlapping (e.g. Nov 1-2 overlaps Nov 2-3)
 * - PlainDateTime, Instant, Zoned uses exclusive overlapping (e.g. 1-2pm does not overlap 2-3pm)
 */
export function rangesOverlap<T extends DateLike>(
  a: readonly [Concrete<T>, Concrete<T>],
  b: readonly [Concrete<T>, Concrete<T>],
  opts?: { inclusive?: boolean },
): boolean {
  const inclusive = opts?.inclusive ?? isDate(a[0]);

  if (inclusive) {
    return compare(a[0], b[1]) <= 0 && compare(a[1], b[0]) >= 0;
  } else {
    return compare(a[0], b[1]) < 0 && compare(a[1], b[0]) > 0;
  }
}
