import { getTemporal } from "./temporal";
import type {
  DateLike,
  Instant,
  PlainDate,
  PlainDateTime,
  PlainTime,
  TimeLike,
  Zoned,
} from "./types";

// Guards `instanceof`-check against the single active Temporal. temporal-fun assumes
// one Temporal instance per process; objects from a second copy are unsupported (their
// state isn't cross-readable) and intentionally read as "not a Temporal type".

/**
 * Type guard for Temporal.PlainDate
 */
export function isDate(value: unknown): value is PlainDate {
  return value instanceof getTemporal().PlainDate;
}

/**
 * Type guard for Temporal.PlainDateTime
 */
export function isDateTime(value: unknown): value is PlainDateTime {
  return value instanceof getTemporal().PlainDateTime;
}

/**
 * Type guard for Temporal.ZonedDateTime
 */
export function isZoned(value: unknown): value is Zoned {
  return value instanceof getTemporal().ZonedDateTime;
}

/**
 * Type guard for Temporal.PlainTime
 */
export function isTime(value: unknown): value is PlainTime {
  return value instanceof getTemporal().PlainTime;
}

/**
 * Type guard for Temporal.Instant
 */
export function isInstant(value: unknown): value is Instant {
  return value instanceof getTemporal().Instant;
}

/**
 * Type guard for DateLike types (all date-oriented temporal types)
 */
export function isDateLike(value: unknown): value is DateLike {
  const T = getTemporal();
  return (
    value instanceof T.PlainDate ||
    value instanceof T.PlainDateTime ||
    value instanceof T.ZonedDateTime ||
    value instanceof T.Instant
  );
}

/**
 * Type guard for TimeLike types (all time-oriented temporal types)
 */
export function isTimeLike(value: unknown): value is TimeLike {
  const T = getTemporal();
  return (
    value instanceof T.PlainTime ||
    value instanceof T.PlainDateTime ||
    value instanceof T.ZonedDateTime ||
    value instanceof T.Instant
  );
}
