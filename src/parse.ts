import { Temporal } from "temporal-polyfill";
import { safeParse } from "./internal";
import type {
  DateLike,
  Instant,
  PlainDate,
  PlainDateTime,
  PlainTime,
  TimeLike,
  Zoned,
} from "./types";

/**
 * Detects the type of a string representation of a date/time
 */
function detectTemporalType(
  dateStr: string,
):
  | "plain-date"
  | "plain-time"
  | "plain-datetime"
  | "zoned-datetime"
  | "instant"
  | "iso-with-offset"
  | "unknown" {
  // Check for instant (ends with Z)
  if (dateStr.endsWith("Z")) {
    return "instant";
  }

  // Check for bracketed timezone (e.g., "[America/New_York]")
  if (dateStr.endsWith("]")) {
    return "zoned-datetime";
  }

  // Check for offset
  // Note: +/- is maby be in date portion (year) or offset
  if (/[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return "iso-with-offset";
  }

  const hasDate = dateStr.includes("-");
  const hasTime = dateStr.includes(":");

  if (hasDate && hasTime) return "plain-datetime";
  if (hasDate) return "plain-date";
  if (hasTime) return "plain-time";
  return "unknown";
}

/**
 * Parses a PlainDate string
 */
export function parseDate(input: string): PlainDate {
  return Temporal.PlainDate.from(input);
}

/**
 * Parses a PlainDateTime string
 */
export function parseDateTime(input: string): PlainDateTime {
  return Temporal.PlainDateTime.from(input);
}

/**
 * Parses a ZonedDateTime string
 * Unlike Temporal.ZonedDateTime.from(), includes fallback for outdated timezone formats and offset/timezone mismatches
 * And supports parsing ISO-8601 straight to Zoned (normally Instant)
 */
export function parseZoned(input: string): Zoned {
  try {
    return Temporal.ZonedDateTime.from(input);
  } catch (err) {
    try {
      // Fix cases where offset and timezone combination are invalid
      // This can happen when round-tripping through different versions of the IANA DB with different timezone rules
      // Parse the ISO 8601 part as an Instant, and then re-apply the timezone (which may adjust the offset)
      const [, isoPart, timeZone] = input.match(/^(.*?)\[(.+)\]$/) || [];
      if (isoPart && timeZone) {
        return Temporal.Instant.from(isoPart).toZonedDateTimeISO(timeZone);
      }

      // Allow parsing ISO-8601 to Zoned with UTC timezone.
      return Temporal.Instant.from(input).toZonedDateTimeISO("UTC");
    } catch {
      // rethrow the original ZonedDateTime parsing error
      throw err;
    }
  }
}

/**
 * Parses a PlainTime from various formats
 * Unlike Temporal.PlainTime.from(), supports 12-hour format (2:30pm)
 */
export function parseTime(timeStr: string): PlainTime {
  // Try 12-hour format first (e.g., "2:30pm" or "2:30 pm")
  if (/(am|pm)$/i.test(timeStr)) {
    return parseTimeFrom12Hour(timeStr);
  }

  // Try ISO time format (e.g., "14:30")
  return Temporal.PlainTime.from(timeStr);
}

/**
 * Parse a PlainTime from 12-hour format string (e.g., "2:30pm")
 */
function parseTimeFrom12Hour(time: string): PlainTime {
  const match = time.match(/(\d+):(\d+)\s*(am|pm)/i);
  if (!match) {
    throw new Error(`Invalid 12-hour time format: ${time}`);
  }

  const [, hourStr, minuteStr, ampm] = match;
  if (!hourStr || !minuteStr || !ampm) {
    throw new Error(`Invalid 12-hour time format: ${time}`);
  }
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // Validate 12-hour format ranges
  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new Error(`Invalid 12-hour time format: ${time}`);
  }

  let hour24 = hour;
  if (ampm.toLowerCase() === "pm" && hour !== 12) {
    hour24 += 12;
  } else if (ampm.toLowerCase() === "am" && hour === 12) {
    hour24 = 0;
  }

  return Temporal.PlainTime.from({ hour: hour24, minute });
}

/**
 * Parses an Instant string
 */
export function parseInstant(input: string): Instant {
  return Temporal.Instant.from(input);
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
    case "iso-with-offset": {
      // Parse as Instant first, then create Zoned with offset timezone
      // Because Instant can parse offsets, but doesn't store them
      const instant = Temporal.Instant.from(input);
      const offsetMatch = input.match(/([+-]\d{2}:\d{2})$/);
      if (!offsetMatch || !offsetMatch[1]) {
        throw new Error(`Expected timezone offset in string: ${input}`);
      }
      return instant.toZonedDateTimeISO(offsetMatch[1]);
    }
    default:
      throw new Error(`Unable to parse ${type} string: ${input}`);
  }
}

/**
 * Parses a TimeLike string with intelligent type detection
 */
export function parseTimeLike(input: string): TimeLike {
  const type = detectTemporalType(input);

  switch (type) {
    case "plain-time":
      return parseTime(input);
    case "plain-datetime":
      return parseDateTime(input);
    case "zoned-datetime":
      return parseZoned(input);
    case "instant":
      return parseInstant(input);
    case "iso-with-offset": {
      const instant = Temporal.Instant.from(input);
      const offsetMatch = input.match(/([+-]\d{2}:\d{2})$/);
      if (!offsetMatch || !offsetMatch[1]) {
        throw new Error(`Expected timezone offset in string: ${input}`);
      }
      return instant.toZonedDateTimeISO(offsetMatch[1]);
    }
    default:
      throw new Error(`Unable to parse time-like string: ${input}`);
  }
}

// ============= VALIDATION FUNCTIONS =============

/**
 * Validate that a string can be parsed as a PlainDate
 */
export function isValidDateString(dateStr: string): boolean {
  return safeParse(parseDate, dateStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a PlainDateTime
 */
export function isValidDateTimeString(dateTimeStr: string): boolean {
  return safeParse(parseDateTime, dateTimeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a ZonedDateTime
 */
export function isValidZonedString(zonedDateTimeStr: string): boolean {
  return safeParse(parseZoned, zonedDateTimeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as a PlainTime
 */
export function isValidTimeString(timeStr: string): boolean {
  return safeParse(parseTime, timeStr) !== undefined;
}

/**
 * Validate that a string can be parsed as an Instant
 */
export function isValidInstantString(instantStr: string): boolean {
  return safeParse(parseInstant, instantStr) !== undefined;
}
