import { Temporal } from "temporal-polyfill";
import { compare } from "./compare";
import * as config from "./config";
import { isDate, isDateLike, isDateTime, isInstant, isTimeLike, isZoned } from "./guards";
import { type Concrete, constructorName, uncheckedCompare } from "./internal";
import type {
  DateLike,
  Instant,
  PlainDate,
  PlainDateTime,
  PlainTime,
  TimeLike,
  WeekStartsOn,
  Zoned,
} from "./types";

const MIN_TIME = {
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0,
};

const MAX_TIME = {
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999,
};

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
    return datelike.with(MIN_TIME) as T;
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
export function endOfDay<T extends DateLike>(datelike: T): T extends PlainDate ? PlainDateTime : T {
  if (isDate(datelike)) {
    return datelike.toPlainDateTime(MAX_TIME) as T extends PlainDate ? PlainDateTime : T;
  }

  if (isDateTime(datelike)) {
    return datelike.with(MAX_TIME) as T extends PlainDate ? PlainDateTime : T;
  }

  if (isZoned(datelike)) {
    return datelike.with(MAX_TIME) as T extends PlainDate ? PlainDateTime : T;
  }

  if (isInstant(datelike)) {
    const utcZdt = datelike.toZonedDateTimeISO("UTC");
    const endOfDayZdt = utcZdt.with(MAX_TIME);
    return endOfDayZdt.toInstant() as T extends PlainDate ? PlainDateTime : T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the start of the week for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input (Instant returns Instant, etc.)
 */
export function startOfWeek<T extends DateLike>(datelike: T, weekStartsOn?: WeekStartsOn): T {
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
    const startOfWeekZdt = utcZdt.startOfDay().subtract({ days: daysToSubtract });
    return startOfWeekZdt.toInstant() as T;
  }

  throw new Error(`Unsupported DateLike type: ${typeof datelike}`);
}

/**
 * Returns the end of the week for any DateLike type
 * - Instant: treated as UTC
 * - Returns same type as input, except PlainDate returns PlainDateTime for end of day
 */
export function endOfWeek<T extends DateLike>(datelike: T, weekStartsOn?: WeekStartsOn): T {
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
      ...MIN_TIME,
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
      ...MIN_TIME,
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

function singularUnit<T extends Temporal.DateTimeUnit>(unit: T | Temporal.PluralUnit<T>): T {
  // All DateTimeUnits can be singularized without the trailing 's'
  if (unit.endsWith("s")) {
    return unit.slice(0, -1) as T;
  }
  return unit as T;
}

function isTimeUnit(unit: Temporal.DateTimeUnit): unit is Temporal.TimeUnit {
  return ["hour", "minute", "second", "millisecond", "microsecond", "nanosecond"].includes(unit);
}

function isDateUnit(unit: Temporal.DateTimeUnit): unit is Temporal.DateUnit {
  return ["year", "month", "week", "day"].includes(unit);
}

type RoundingUnit<T> = T extends PlainTime
  ? Temporal.SmallestUnit<Temporal.TimeUnit>
  : T extends PlainDate
    ? Temporal.SmallestUnit<Temporal.DateUnit>
    : T extends PlainDateTime | Zoned | Instant
      ? Temporal.SmallestUnit<Temporal.DateTimeUnit>
      : never;

/**
 * Rounds the time down to the given unit.
 *
 * @param value - Component with date or time value to floor
 * @param smallestUnit - date or time unit (e.g. "day", "minute", "second")
 * @returns value floored the the specified smallest unit
 */
export function floor<T extends TimeLike | DateLike>(value: T, smallestUnit: RoundingUnit<T>): T {
  const unit = singularUnit(smallestUnit);
  if (isTimeLike(value) && isTimeUnit(unit)) {
    return value.round({
      smallestUnit: unit,
      roundingMode: "trunc",
    }) as T;
  }

  if (isDateLike(value) && isDateUnit(unit)) {
    if (unit === "year") {
      return startOfYear(value);
    }
    if (unit === "month") {
      return startOfMonth(value);
    }
    if (unit === "week") {
      throw new Error("Use startOfWeek instead to resolve weekStartsOn ambiguity");
    }
    if (unit === "day") {
      return startOfDay(value);
    }
  }

  throw new Error(`Unable to floor ${constructorName(value) ?? typeof value} to unit ${unit}`);
}

/**
 * Rounds the time up to the given unit.
 *
 * Note: while flooring date units is essentially an alternative to startOf- functions
 * ceil is NOT an alternative to endOf- functions.
 * ceil always round to the start of the next value specified by smallestUnit
 * unless the value is already aligned to the smallestUnit.
 *
 * @param value - Component with date or time value to ceil
 * @param smallestUnit - date or time unit (e.g. "day", "minute", "second")
 * @returns value ceiled the the specified smallest unit
 */
export function ceil<T extends TimeLike | DateLike>(value: T, smallestUnit: RoundingUnit<T>): T {
  const unit = singularUnit(smallestUnit);
  if (isTimeLike(value) && isTimeUnit(unit)) {
    return value.round({
      smallestUnit: unit,
      roundingMode: "ceil",
    }) as T;
  }

  if (isDateLike(value) && isDateUnit(unit)) {
    if (unit === "week") {
      throw new Error("ceil for week unit is ambiguous without weekStartsOn value");
    }

    const floored = floor(value, smallestUnit) as DateLike;
    if (uncheckedCompare(value, floored) === 0) {
      return value;
    }

    return floored.add({
      years: unit === "year" ? 1 : 0,
      months: unit === "month" ? 1 : 0,
      days: unit === "day" ? 1 : 0,
    }) as T;
  }

  throw new Error(`Unable to ceil ${constructorName(value) ?? typeof value} to unit ${unit}`);
}

export function round<T extends TimeLike | DateLike>(value: T, smallestUnit: RoundingUnit<T>): T {
  const unit = singularUnit(smallestUnit);
  if (isTimeLike(value) && isTimeUnit(unit)) {
    return value.round({
      smallestUnit: unit,
      roundingMode: "halfExpand",
    }) as T;
  }

  if (isDateUnit(unit)) {
    if (isDate(value)) {
    }
  }
  if (isDateLike(value) && isDateUnit(unit)) {
    if (unit === "week") {
      throw new Error("Use endOfWeek instead to resolve weekStartsOn ambiguity");
    }

    const floored = floor<T>(value, smallestUnit);
    const ceiled = ceil<T>(value, smallestUnit);
    // biome-ignore lint/suspicious/noExplicitAny: value is T
    const diff1 = floored.until(value as any);
    // biome-ignore lint/suspicious/noExplicitAny: value is T
    const diff2 = value.until(ceiled as any);

    return Temporal.Duration.compare(diff1, diff2) < 0 ? floored : ceiled;
  }

  throw new Error(
    `Unable to round ${constructorName(value) ?? typeof value} to unit ${smallestUnit}`,
  );
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
export function eachDayOfInterval<T extends DateLike>(interval: {
  start: Concrete<T>;
  end: Concrete<T>;
}): T[] {
  return stepInterval(interval, { days: 1 });
}

/**
 * Returns an array of the start of each week in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachWeekOfInterval<T extends DateLike>(
  interval: { start: Concrete<T>; end: Concrete<T> },
  options: { weekStartsOn?: WeekStartsOn } = {},
): T[] {
  const { start, end } = interval;
  const { weekStartsOn = config.getWeekStart() } = options;

  const result: Concrete<T>[] = [];

  // Convert start of week to PlainDate and loop
  let current = startOfWeek(start, weekStartsOn);
  while (compare(current, end) <= 0) {
    result.push(current);
    current = current.add({ days: 7 }) as Concrete<T>;
  }

  return result;
}

/**
 * Returns an array of the start of each month in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachMonthOfInterval<T extends DateLike>(interval: {
  start: Concrete<T>;
  end: Concrete<T>;
}): T[] {
  const { start, end } = interval;
  const result: T[] = [];

  let current = startOfMonth(start);
  while (compare(current, end) <= 0) {
    result.push(current);
    current = current.add({ months: 1 }) as Concrete<T>;
  }

  return result;
}

/**
 * Returns an array of the start of each year in the given interval
 * Works with any DateLike types - returns PlainDate array for consistency
 */
export function eachYearOfInterval<T extends DateLike>(interval: {
  start: Concrete<T>;
  end: Concrete<T>;
}): T[] {
  const { start, end } = interval;
  const result: T[] = [];

  let current = startOfYear(start);
  while (compare(current, end) <= 0) {
    result.push(current);
    current = current.add({ years: 1 }) as Concrete<T>;
  }

  return result;
}
