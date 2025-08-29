import { Temporal } from "temporal-polyfill";
import {
  PlainDate,
  PlainDateTime,
  Zoned,
  PlainTime,
  Instant,
  DateLike,
  TimeLike,
} from "./types";

/**
 * Helper to catch errors and return undefined for safe parsing
 */
function catchAsUndefined<T, Args extends unknown[]>(
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

/**
 * Detects the type of a string representation of a date/time
 */
function detectTemporalType(
  dateStr: string,
):
  | "plain-date"
  | "plain-datetime"
  | "zoned-datetime"
  | "instant"
  | "iso-with-offset"
  | "unknown" {
  try {
    // Check for instant (ends with Z)
    if (dateStr.endsWith("Z")) {
      return "instant";
    }

    // Check for bracketed timezone (e.g., "[America/New_York]")
    if (dateStr.includes("[") && dateStr.includes("]")) {
      return "zoned-datetime";
    }

    // Check for ISO format with numeric timezone offset (+/-HH:MM)
    if (dateStr.includes("T") && /[+-]\d{2}:\d{2}$/.test(dateStr)) {
      return "iso-with-offset";
    }

    // Check for date + time format without timezone
    if (
      dateStr.includes("T") ||
      (dateStr.includes(" ") && dateStr.length > 10)
    ) {
      return "plain-datetime";
    }

    // Check for simple date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return "plain-date";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Parses a PlainDate string
 * Identical to Temporal.PlainDate.from(input) - provided for consistency
 */
export function parseDate(input: string): PlainDate {
  return Temporal.PlainDate.from(input);
}

/**
 * Parses a PlainDateTime string
 * Unlike Temporal.PlainDateTime.from(), accepts both "T" and space separators between date and time
 */
export function parseDateTime(input: string): PlainDateTime {
  return Temporal.PlainDateTime.from(input.replace(" ", "T"));
}

/**
 * Parses a ZonedDateTime string
 * Unlike Temporal.ZonedDateTime.from(), includes fallback for outdated timezone formats and offset/timezone mismatches
 */
export function parseZoned(input: string): Zoned {
  try {
    return Temporal.ZonedDateTime.from(input);
  } catch {
    const [, isoPart, timeZone] = input.match(/^(.*?)\[(.+)\]$/) || [];
    if (!isoPart || !timeZone) {
      throw new Error(`Invalid ZonedDateTime string: ${input}`);
    }
    return Temporal.Instant.from(isoPart).toZonedDateTimeISO(timeZone);
  }
}

/**
 * Parses a PlainTime from various formats
 * Unlike Temporal.PlainTime.from(), supports 12-hour format (2:30pm) and decimal hours (9.5)
 */
export function parseTime(timeStr: string): PlainTime {
  // Try 12-hour format first (e.g., "2:30pm" or "2:30 pm")
  if (/^\d{1,2}:\d{2}\s*(am|pm)$/i.test(timeStr)) {
    return parseTimeFrom12Hour(timeStr);
  }

  // Try decimal hour format (e.g., "9.5" - must be purely numeric with optional decimal)
  if (/^\d+(\.\d+)?$/.test(timeStr)) {
    const decimalHour = parseFloat(timeStr);
    if (decimalHour >= 0 && decimalHour < 24) {
      const hour = Math.floor(decimalHour);
      const minute = Math.floor((decimalHour - hour) * 60);
      const second = Math.floor(((decimalHour - hour) * 60 - minute) * 60);
      return new PlainTime(hour, minute, second);
    }
  }

  // Try ISO time format (e.g., "14:30")
  try {
    return Temporal.PlainTime.from(timeStr);
  } catch {
    throw new Error(`Unable to parse time: ${timeStr}`);
  }
}

/**
 * Parse a PlainTime from 12-hour format string (e.g., "2:30pm")
 */
export function parseTimeFrom12Hour(time: string): PlainTime {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) {
    throw new Error(`Invalid 12-hour time format: ${time}`);
  }

  const [, hourStr, minuteStr, ampm] = match;
  const hour = parseInt(hourStr!, 10);
  const minute = parseInt(minuteStr!, 10);

  // Validate 12-hour format ranges
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new Error(`Invalid 12-hour time format: ${time}`);
  }

  let hour24 = hour;
  if (ampm!.toLowerCase() === "pm" && hour !== 12) {
    hour24 += 12;
  } else if (ampm!.toLowerCase() === "am" && hour === 12) {
    hour24 = 0;
  }

  return Temporal.PlainTime.from({ hour: hour24, minute });
}

/**
 * Parses an Instant string
 * Unlike Temporal.Instant.from(), includes fallback to legacy Date parsing for broader compatibility
 */
export function parseInstant(input: string): Instant {
  try {
    return Temporal.Instant.from(input);
  } catch {
    // Fallback to Date parsing
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      throw new Error(`Unable to parse instant from: ${input}`);
    }
    return Temporal.Instant.fromEpochMilliseconds(date.getTime());
  }
}

/**
 * Parses a DateLike string with intelligent type detection
 */
export function parseDateLike(input: string): DateLike {
  const type = detectTemporalType(input);

  switch (type) {
    case "plain-date":
      return parseDate(input);
    case "plain-datetime":
      return parseDateTime(input);
    case "zoned-datetime":
      return parseZoned(input);
    case "instant":
      return parseInstant(input);
    case "iso-with-offset":
      // Parse as instant first, then create ZDT with offset timezone
      const instant = Temporal.Instant.from(input);
      const offsetMatch = input.match(/([+-]\d{2}:\d{2})$/);
      if (!offsetMatch || !offsetMatch[1]) {
        throw new Error(`Expected timezone offset in string: ${input}`);
      }
      return instant.toZonedDateTimeISO(offsetMatch[1]);
    default:
      // Try to parse as Date and convert to Instant
      const date = new Date(input);
      if (isNaN(date.getTime())) {
        throw new Error(`Unable to parse date-like string: ${input}`);
      }
      return Temporal.Instant.fromEpochMilliseconds(date.getTime());
  }
}

/**
 * Parses a TimeLike string with intelligent type detection
 */
export function parseTimeLike(input: string): TimeLike {
  const type = detectTemporalType(input);

  switch (type) {
    case "plain-datetime":
      return parseDateTime(input);
    case "zoned-datetime":
      return parseZoned(input);
    case "instant":
      return parseInstant(input);
    case "iso-with-offset":
      const instant = Temporal.Instant.from(input);
      const offsetMatch = input.match(/([+-]\d{2}:\d{2})$/);
      if (!offsetMatch || !offsetMatch[1]) {
        throw new Error(`Expected timezone offset in string: ${input}`);
      }
      return instant.toZonedDateTimeISO(offsetMatch[1]);
    default:
      // Try to parse as PlainTime for time-only strings (including 12-hour format)
      try {
        return parseTime(input);
      } catch {
        // Fallback to parsing as Date and convert to Instant
        const date = new Date(input);
        if (isNaN(date.getTime())) {
          throw new Error(`Unable to parse time-like string: ${input}`);
        }
        return Temporal.Instant.fromEpochMilliseconds(date.getTime());
      }
  }
}

// ============= SAFE PARSE FUNCTIONS =============

/**
 * Safely parses a PlainDate string, returning undefined on error
 */
export const safeParseDate = catchAsUndefined(parseDate);

/**
 * Safely parses a PlainDateTime string, returning undefined on error
 */
export const safeParseDateTime = catchAsUndefined(parseDateTime);

/**
 * Safely parses a ZonedDateTime string, returning undefined on error
 */
export const safeParseZoned = catchAsUndefined(parseZoned);

/**
 * Safely parses a PlainTime string, returning undefined on error
 */
export const safeParseTime = catchAsUndefined(parseTime);

/**
 * Safely parses a PlainTime from 12-hour format, returning undefined on error
 */
export const safeParseTimeFrom12Hour = catchAsUndefined(parseTimeFrom12Hour);

/**
 * Safely parses an Instant string, returning undefined on error
 */
export const safeParseInstant = catchAsUndefined(parseInstant);

/**
 * Safely parses a DateLike string, returning undefined on error
 */
export const safeParseDateLike = catchAsUndefined(parseDateLike);

/**
 * Safely parses a TimeLike string, returning undefined on error
 */
export const safeParseTimeLike = catchAsUndefined(parseTimeLike);

// ============= VALIDATION FUNCTIONS =============

/**
 * Validate that a string can be parsed as a PlainDate
 */
export function isValidDateString(dateStr: string): boolean {
  return safeParseDate(dateStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a PlainDateTime
 */
export function isValidDateTimeString(dateTimeStr: string): boolean {
  return safeParseDateTime(dateTimeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a ZonedDateTime
 */
export function isValidZonedString(zonedDateTimeStr: string): boolean {
  return safeParseZoned(zonedDateTimeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a PlainTime
 */
export function isValidTimeString(timeStr: string): boolean {
  return safeParseTime(timeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as an Instant
 */
export function isValidInstantString(instantStr: string): boolean {
  return safeParseInstant(instantStr) !== undefined;
}
