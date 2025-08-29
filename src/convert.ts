import { Temporal } from "temporal-polyfill";
import {
  DateLike,
  TimeLike,
  IntoDateLike,
  IntoTimeLike,
  IntoInstant,
  PlainDate,
  PlainDateTime,
  Zoned,
  PlainTime,
  Instant,
} from "./types.js";
import { isDate, isDateTime, isZoned, isTime, isInstant } from "./guards.js";
import { parseDateLike, parseTimeLike, parseInstant } from "./parse.js";

// ============= CURRENT TIME FUNCTIONS =============

/**
 * Gets the current instant in time
 */
export function now(): Instant {
  return Temporal.Now.instant();
}

/**
 * Gets the current date and time in the specified timezone
 */
export function nowZoned(timezone?: string): Zoned {
  return Temporal.Now.zonedDateTimeISO(timezone);
}

/**
 * Gets today's date in the specified timezone (or system timezone if not provided)
 */
export function today(timezone?: string): PlainDate {
  return Temporal.Now.plainDateISO(timezone);
}

// ============= CONVENIENCE WRAPPERS (IntoType -> Type) =============

/**
 * Converts IntoDateLike to PlainDate
 *
 * Conversion assumptions:
 * - PlainDateTime: extracts date part, discarding time
 * - ZonedDateTime: extracts date part in the zone's local time
 * - Instant: converts to UTC date (assumes UTC timezone)
 * - Date object: converts to UTC date (assumes UTC timezone)
 * - String: parses as PlainDate format (YYYY-MM-DD)
 */
export function date(idl: IntoDateLike): PlainDate {
  const dl = dateLike(idl);

  if (isDate(dl)) return dl;
  if (isDateTime(dl)) return dl.toPlainDate();
  if (isZoned(dl)) return dl.toPlainDate();
  if (isInstant(dl)) return dl.toZonedDateTimeISO("UTC").toPlainDate();

  throw new Error(`Unable to convert to PlainDate: ${typeof dl}`);
}

/**
 * Converts IntoDateLike to PlainDateTime
 *
 * Conversion assumptions:
 * - PlainDate: adds midnight time (00:00:00)
 * - ZonedDateTime: extracts local date/time, discarding timezone info
 * - Instant: converts to UTC date/time (assumes UTC timezone)
 * - Date object: converts to UTC date/time (assumes UTC timezone)
 * - String: parses as PlainDateTime format (YYYY-MM-DDTHH:MM:SS)
 */
export function dateTime(idl: IntoDateLike): PlainDateTime {
  const dl = dateLike(idl);

  if (isDateTime(dl)) return dl;
  if (isDate(dl)) return dl.toPlainDateTime({ hour: 0, minute: 0 });
  if (isZoned(dl)) return dl.toPlainDateTime();
  if (isInstant(dl)) return dl.toZonedDateTimeISO("UTC").toPlainDateTime();

  throw new Error(`Unable to convert to PlainDateTime: ${typeof dl}`);
}

/**
 * Converts IntoDateLike to ZonedDateTime in the specified timezone
 *
 * Conversion assumptions:
 * - PlainDate: adds midnight time (00:00:00) in the target timezone
 * - PlainDateTime: interprets as local time in the target timezone
 * - ZonedDateTime: converts to the target timezone (preserving instant)
 * - Instant: converts directly to the target timezone
 * - Date object: converts via Instant to the target timezone
 * - String: parses intelligently, then converts to target timezone
 */
export function zoned(idl: IntoDateLike, timezone: string): Zoned {
  const dl = dateLike(idl);

  if (isZoned(dl)) {
    return dl.withTimeZone(timezone);
  }

  if (isDateTime(dl)) {
    return dl.toZonedDateTime(timezone);
  }

  if (isDate(dl)) {
    return dl.toPlainDateTime({ hour: 0, minute: 0 }).toZonedDateTime(timezone);
  }

  if (isInstant(dl)) {
    return dl.toZonedDateTimeISO(timezone);
  }

  throw new Error(`Unsupported DateLike type for zdt conversion: ${typeof dl}`);
}

/**
 * Converts IntoTimeLike to PlainTime
 *
 * Conversion assumptions:
 * - PlainDateTime/ZonedDateTime: extracts time part, discarding date
 * - Instant: converts to UTC time (assumes UTC timezone)
 * - Date object: converts to UTC time (assumes UTC timezone)
 * - String: parses as PlainTime format (HH:MM:SS)
 */
export function time(itl: IntoTimeLike): PlainTime {
  // Convert to TimeLike first, then handle TimeLike variations
  const tl = timeLike(itl);

  if (isTime(tl)) return tl;
  if (isDateTime(tl)) return tl.toPlainTime();
  if (isZoned(tl)) return tl.toPlainTime();
  if (isInstant(tl)) return tl.toZonedDateTimeISO("UTC").toPlainTime();

  throw new Error(`Unable to convert to PlainTime: ${typeof tl}`);
}

/**
 * Smart conversion with intelligent type detection
 *
 * Converts various inputs to the most appropriate DateLike type:
 * - String: parses intelligently (PlainDate, PlainDateTime, ZonedDateTime, or Instant)
 * - Date object: converts to Instant (preserves exact moment in time)
 * - DateLike types: returns as-is (no conversion needed)
 */
export function dateLike(idl: IntoDateLike): DateLike {
  if (typeof idl === "string") {
    return parseDateLike(idl);
  }

  if (idl instanceof Date) {
    return Instant.fromEpochMilliseconds(idl.getTime());
  }

  // Already a DateLike
  return idl;
}

/**
 * Time-focused conversion to TimeLike types
 *
 * Converts various inputs to the most appropriate TimeLike type:
 * - String: parses intelligently (PlainTime, PlainDateTime, ZonedDateTime, or Instant)
 * - Date object: converts to Instant (preserves exact moment in time)
 * - TimeLike types: returns as-is (no conversion needed)
 */
export function timeLike(itl: IntoTimeLike): TimeLike {
  if (typeof itl === "string") {
    return parseTimeLike(itl);
  }

  if (itl instanceof Date) {
    return Instant.fromEpochMilliseconds(itl.getTime());
  }

  // Already a TimeLike
  return itl;
}

/**
 * Creates an Instant from various inputs
 *
 * Conversion assumptions:
 * - PlainDate: assumes UTC midnight for the date
 * - PlainDateTime: assumes UTC timezone for the datetime
 * - ZonedDateTime: extracts the exact instant
 * - Date object: converts directly from epoch milliseconds
 * - String: parses as ISO 8601 instant format (YYYY-MM-DDTHH:MM:SSZ)
 */
export function instant(input: IntoInstant): Instant {
  if (typeof input === "string") {
    return parseInstant(input);
  }

  if (input instanceof Date) {
    return Instant.fromEpochMilliseconds(input.getTime());
  }

  if (isInstant(input)) return input;
  if (isZoned(input)) return input.toInstant();
  if (isDateTime(input)) return input.toZonedDateTime("UTC").toInstant();
  if (isDate(input))
    return input
      .toPlainDateTime({ hour: 0, minute: 0 })
      .toZonedDateTime("UTC")
      .toInstant();

  throw new Error(`Unsupported instant input type: ${typeof input}`);
}

// Legacy conversion utilities
/**
 * Converts DateLike to legacy JavaScript Date object
 *
 * Conversion assumptions:
 * - ZonedDateTime: converts to the exact moment (ignores timezone parameter)
 * - Instant: converts to the exact moment (ignores timezone parameter)
 */
export function legacy(datelike: Instant | Zoned): Date {
  if (isZoned(datelike)) {
    return new Date(datelike.toInstant().epochMilliseconds);
  }
  if (isInstant(datelike)) {
    return new Date(datelike.epochMilliseconds);
  }
  throw new Error(
    `Unsupported DateLike type for legacy conversion: ${typeof datelike}`,
  );
}
