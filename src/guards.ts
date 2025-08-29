import { Temporal } from "temporal-polyfill";
import type {
  DateLike,
  TimeLike,
  PlainDate,
  PlainDateTime,
  Zoned,
  PlainTime,
  Instant,
} from "./types";

/**
 * Type guard for Temporal.PlainDate
 */
export function isDate(value: DateLike): value is PlainDate {
  return value instanceof Temporal.PlainDate;
}

/**
 * Type guard for Temporal.PlainDateTime
 */
export function isDateTime(value: DateLike | TimeLike): value is PlainDateTime {
  return value instanceof Temporal.PlainDateTime;
}

/**
 * Type guard for Temporal.ZonedDateTime
 */
export function isZoned(value: DateLike | TimeLike): value is Zoned {
  return value instanceof Temporal.ZonedDateTime;
}

/**
 * Type guard for Temporal.PlainTime
 */
export function isTime(value: TimeLike): value is PlainTime {
  return value instanceof Temporal.PlainTime;
}

/**
 * Type guard for Temporal.Instant
 */
export function isInstant(value: DateLike | TimeLike): value is Instant {
  return value instanceof Temporal.Instant;
}

/**
 * Type guard for DateLike types (all date-oriented temporal types)
 */
export function isDateLike(value: unknown): value is DateLike {
  return (
    value instanceof Temporal.PlainDate ||
    value instanceof Temporal.PlainDateTime ||
    value instanceof Temporal.ZonedDateTime ||
    value instanceof Temporal.Instant
  );
}

/**
 * Type guard for TimeLike types (all time-oriented temporal types)
 */
export function isTimeLike(value: unknown): value is TimeLike {
  return (
    value instanceof Temporal.PlainTime ||
    value instanceof Temporal.PlainDateTime ||
    value instanceof Temporal.ZonedDateTime ||
    value instanceof Temporal.Instant
  );
}
