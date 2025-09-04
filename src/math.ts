import { Temporal } from "temporal-polyfill";
import type {
  WeekStartsOn,
  DateLike,
  Zoned,
  PlainDate,
  PlainDateTime,
  Instant,
} from "./types";
import { isDate, isDateTime, isZoned, isInstant } from "./guards";
import { date } from "./convert";
import { compare } from "./compare";
import * as config from "./config";
import { Concrete } from "./internal";

/**
 * Returns the start of the day for any DateLike type
 * - PlainDate: no-op (returns the same PlainDate)
 * - PlainDateTime: sets time to 00:00:00
 * - ZonedDateTime: uses native startOfDay()
 * - Instant: converts to UTC ZonedDateTime, gets start of day, converts back to Instant
 */
export function startOfDay<T extends DateLike>(datelike: T): T {
  if (isDate(datelike)) {
    return datelike; // no-op for PlainDate
  }

  if (isDateTime(datelike)) {
    return datelike.with({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      nanosecond: 0,
    }) as T;
  }

  if (isZoned(datelike)) {
    return datelike.startOfDay() as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const startOfDayZdt = utcZdt.startOfDay();
    return startOfDayZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the end of the day for any DateLike type
 * - PlainDate: converts to PlainDateTime at 23:59:59.999
 * - PlainDateTime: sets time to 23:59:59.999
 * - ZonedDateTime: sets time to 23:59:59.999
 * - Instant: converts to UTC ZonedDateTime, gets end of day, converts back to Instant
 */
export function endOfDay<T extends DateLike>(
  datelike: T,
): T extends PlainDate ? PlainDateTime : T {
  const timeComponent = {
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  };
  if (isDate(datelike)) {
    return datelike.toPlainDateTime(timeComponent) as T extends PlainDate
      ? PlainDateTime
      : T;
  }

  if (isDateTime(datelike)) {
    return datelike.with(timeComponent) as T extends PlainDate
      ? PlainDateTime
      : T;
  }

  if (isZoned(datelike)) {
    return datelike.with(timeComponent) as T extends PlainDate
      ? PlainDateTime
      : T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const endOfDayZdt = utcZdt.with(timeComponent);
    return endOfDayZdt.toInstant() as T extends PlainDate ? PlainDateTime : T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the start of the week for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input (Instant returns Instant, etc.)
 */
export function startOfWeek<T extends DateLike>(
  datelike: T,
  weekStartsOn?: WeekStartsOn,
): T {
  const weekStart = weekStartsOn ?? config.getWeekStart();
  if (isDate(datelike)) {
    const dayOfWeek = datelike.dayOfWeek;
    const daysToSubtract = (dayOfWeek + 7 - weekStart) % 7;
    return datelike.subtract({ days: daysToSubtract }) as T;
  }

  if (isDateTime(datelike)) {
    const dayOfWeek = datelike.dayOfWeek;
    const daysToSubtract = (dayOfWeek + 7 - weekStart) % 7;
    const startDate = datelike.toPlainDate().subtract({ days: daysToSubtract });
    return startDate.toPlainDateTime() as T;
  }

  if (isZoned(datelike)) {
    const dayOfWeek = datelike.dayOfWeek;
    const daysToSubtract = (dayOfWeek + 7 - weekStart) % 7;
    return datelike.startOfDay().subtract({ days: daysToSubtract }) as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const dayOfWeek = utcZdt.dayOfWeek;
    const daysToSubtract = (dayOfWeek + 7 - weekStart) % 7;
    const startOfWeekZdt = utcZdt
      .startOfDay()
      .subtract({ days: daysToSubtract });
    return startOfWeekZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the end of the week for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input, except PlainDate returns PlainDateTime for end of day
 */
export function endOfWeek<T extends DateLike>(
  datelike: T,
  weekStartsOn?: WeekStartsOn,
): T {
  const startOfWeekDate = startOfWeek(datelike, weekStartsOn);

  if (isDate(datelike) || isDateTime(datelike) || isZoned(datelike)) {
    const endDate = startOfWeekDate.add({ days: 6 });
    return endOfDay(endDate) as T;
  }

  if (isInstant(datelike)) {
    // For Instant, work in UTC timezone
    const utcZdt = (startOfWeekDate as Instant).toZonedDateTimeISO("UTC");
    const endOfWeekZdt = endOfWeek(utcZdt, weekStartsOn);
    return endOfWeekZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the start of the month for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input
 */
export function startOfMonth<T extends DateLike>(datelike: T): T {
  if (isDate(datelike)) {
    return datelike.with({ day: 1 }) as T;
  }

  if (isDateTime(datelike)) {
    return datelike.with({
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }) as T;
  }

  if (isZoned(datelike)) {
    return datelike.with({ day: 1 }).startOfDay() as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const startOfMonthZdt = utcZdt.with({ day: 1 }).startOfDay();
    return startOfMonthZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the end of the month for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input, except PlainDate returns PlainDateTime for end of day
 */
export function endOfMonth<T extends DateLike>(datelike: T): T {
  if (isDate(datelike)) {
    const lastDayOfMonth = datelike.with({ day: datelike.daysInMonth });
    return lastDayOfMonth as T;
  }

  if (isDateTime(datelike)) {
    const lastDayOfMonth = datelike.with({ day: datelike.daysInMonth });
    return endOfDay(lastDayOfMonth) as T;
  }

  if (isZoned(datelike)) {
    const lastDayOfMonth = datelike.with({ day: datelike.daysInMonth });
    return endOfDay(lastDayOfMonth) as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const lastDayOfMonth = utcZdt.with({ day: utcZdt.daysInMonth });
    const endOfMonthZdt = endOfDay(lastDayOfMonth);
    return (endOfMonthZdt as Zoned).toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the start of the year for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input
 */
export function startOfYear<T extends DateLike>(datelike: T): T {
  if (isDate(datelike)) {
    return datelike.with({ month: 1, day: 1 }) as T;
  }

  if (isDateTime(datelike)) {
    return datelike.with({
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    }) as T;
  }

  if (isZoned(datelike)) {
    return datelike.with({ month: 1, day: 1 }).startOfDay() as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const startOfYearZdt = utcZdt.with({ month: 1, day: 1 }).startOfDay();
    return startOfYearZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the end of the year for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input, except PlainDate returns PlainDateTime for end of day
 */
export function endOfYear<T extends DateLike>(datelike: T): T {
  if (isDate(datelike)) {
    const lastDayOfYear = datelike.with({ month: 12, day: 31 });
    return lastDayOfYear as T;
  }

  if (isDateTime(datelike)) {
    const lastDayOfYear = datelike.with({ month: 12, day: 31 });
    return endOfDay(lastDayOfYear) as T;
  }

  if (isZoned(datelike)) {
    const lastDayOfYear = datelike.with({ month: 12, day: 31 });
    return endOfDay(lastDayOfYear) as T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const lastDayOfYear = utcZdt.with({ month: 12, day: 31 });
    const endOfYearZdt = endOfDay(lastDayOfYear);
    return endOfYearZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns an array of date like values over given interval
 * Works with any DateLike types - returns same type as input
 */
export function stepInterval<T extends DateLike>(
  interval: {
    start: Concrete<T>;
    end: Concrete<T>;
  },
  step: Temporal.Duration | Temporal.DurationLike,
): T[] {
  const { start, end } = interval;
  const result: T[] = [];

  // Loop until we reach or exceed the end date
  let current = start;
  while (compare(current, end) <= 0) {
    result.push(current);
    current = current.add(step) as Concrete<T>;
  }

  return result;
}

/**
 * Returns an array of each day in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachDayOfInterval(interval: {
  start: DateLike;
  end: DateLike;
}): PlainDate[] {
  const pdInterval = { start: date(interval.start), end: date(interval.end) };
  return stepInterval(pdInterval, { days: 1 });
}

/**
 * Returns an array of the start of each week in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachWeekOfInterval(
  interval: { start: DateLike; end: DateLike },
  options: { weekStartsOn?: WeekStartsOn } = {},
): PlainDate[] {
  const { start, end } = interval;
  const { weekStartsOn = config.getWeekStart() } = options;

  const startOfWeekDate = startOfWeek(date(start), weekStartsOn);
  const endDate = date(end);
  const result: PlainDate[] = [];

  // Convert start of week to PlainDate and loop
  let current = startOfWeekDate;
  while (Temporal.PlainDate.compare(current, endDate) <= 0) {
    result.push(current);
    current = current.add({ days: 7 });
  }

  return result;
}

/**
 * Returns an array of the start of each month in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachMonthOfInterval(interval: {
  start: DateLike;
  end: DateLike;
}): PlainDate[] {
  const { start, end } = interval;
  const result: PlainDate[] = [];

  const startOfMonthDate = date(startOfMonth(start));
  const endDate = date(end);

  let current = startOfMonthDate;
  while (Temporal.PlainDate.compare(current, endDate) <= 0) {
    result.push(current);
    current = current.add({ months: 1 });
  }

  return result;
}

/**
 * Returns an array of the start of each year in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachYearOfInterval(interval: {
  start: DateLike;
  end: DateLike;
}): PlainDate[] {
  const { start, end } = interval;
  const result: PlainDate[] = [];

  const startOfYearDate = date(startOfYear(start));
  const endDate = date(end);

  let current = startOfYearDate;
  while (Temporal.PlainDate.compare(current, endDate) <= 0) {
    result.push(current);
    current = current.add({ years: 1 });
  }

  return result;
}
