import { DateLike, PlainDate, PlainTime, TimeLike } from "./types";
import {
  isDate,
  isDateLike,
  isDateTime,
  isInstant,
  isTime,
  isTimeLike,
  isZoned,
} from "./guards";
import * as config from "./config";
import { nowZoned, zoned } from "./convert";

// Rather than re-inventing temporal string formatting,
// we provide consts that cover the most common cases
// and make it easy to extend with Intl.DateTimeFormatOptions overrides
//
//
// datelike.toString() // RFC 9557 formatted (or RFC 9557 + timezone for Zoned)
//
// dateLike.toLocaleString() // default locale format via Temporal API
// dateLike.toLocaleString("en-US", DateTimeFmt.Short)
//
// To extend:
// const weekdayShort = {...DateFmt.Short, weekday: "short"}
// dateLike.toLocaleString("en-US", weekdayShort)

export const DateFmt = {
  // 3/24/25
  Short: { year: "2-digit", month: "numeric", day: "numeric" },
  // Mar 24, 2025
  Medium: { dateStyle: "medium" },
  // March 24, 2025
  Long: { dateStyle: "long" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export const TimeFmt = {
  // 8:30 AM
  Short12h: { hour: "numeric", minute: "2-digit", hour12: true },
  // 8:30:05 AM
  Long12h: {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  },
  // 08:30
  Short24h: { hour: "2-digit", minute: "2-digit", hour12: false },
  // 08:30:05
  Long24h: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export const DateTimeFmt = {
  // 3/24/25, 8:30 AM
  Short12h: { dateStyle: "short", timeStyle: "short", hour12: true },
  // Mar 24, 2025, 8:30 AM
  Medium12h: { dateStyle: "medium", timeStyle: "short", hour12: true },
  // March 24, 2025 at 8:30:05 AM
  Long12h: { dateStyle: "long", timeStyle: "medium", hour12: true },
  // 3/24/25, 08:30
  Short24h: { dateStyle: "short", timeStyle: "short", hour12: false },
  // Mar 24, 2025, 08:30
  Medium24h: { dateStyle: "medium", timeStyle: "short", hour12: false },
  // March 24, 2025 at 08:30:05
  Long24h: { dateStyle: "long", timeStyle: "medium", hour12: false },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export const ZonedFmt = {
  // 3/24/25, 8:30 AM PST
  Short12h: {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  },
  // Mar 24, 2025, 8:30 AM PST
  Medium12h: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  },
  // March 24, 2025 at 8:30:05 AM Pacific Standard Time
  Long12h: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "long",
  },
  // 3/24/25, 08:30 PST
  Short24h: {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  },
  // Mar 24, 2025, 08:30 PST
  Medium24h: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  },
  // March 24, 2025 at 08:30:05 Pacific Standard Time
  Long24h: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "long",
  },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export const InstantFmt = {
  // UTC time formatted as short datetime
  Short: {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
    timeZone: "UTC",
  },
  // UTC time formatted as medium datetime
  Medium: {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: false,
    timeZone: "UTC",
  },
  // UTC time formatted as long datetime with UTC indicator
  Long: {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
    timeZoneName: "short",
  },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * Formats the distance from now as a relative time string
 * e.g. "2 days ago" or "in 30 minutes"
 */
export function fmtRelativeToNow(
  dl: DateLike,
  options?: {
    locales?: Intl.LocalesArgument;
    style?: Intl.RelativeTimeFormatStyle;
  },
): string {
  const zdt = isZoned(dl) ? dl : zoned(dl, "UTC");
  const now = nowZoned(zdt.timeZoneId);
  const isPast = zdt.epochMilliseconds < now.epochMilliseconds;

  const { years, months, weeks, days, hours, minutes, seconds } = isPast
    ? zdt.until(now, { largestUnit: "years" })
    : now.until(zdt, { largestUnit: "years" });

  const [unit, value] = Object.entries({
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
  }).find(([, v]) => v) || ["seconds", 0];

  const locales = options?.locales ?? config.getLocales();
  return new Intl.RelativeTimeFormat(locales, {
    numeric: "auto",
    style: options?.style,
  }).format(isPast ? -value : value, unit as Intl.RelativeTimeFormatUnit);
}

export function fmtShort(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[]; hour12?: boolean },
): string {
  const { locales = config.getLocales(), hour12 = false } = opts || {};
  let fmt;
  if (isDateLike(dl)) {
    if (isDate(dl)) fmt = DateFmt.Short;
    if (isDateTime(dl))
      fmt = hour12 ? DateTimeFmt.Short12h : DateTimeFmt.Short24h;
    if (isZoned(dl)) fmt = hour12 ? ZonedFmt.Short12h : ZonedFmt.Short24h;
    if (isInstant(dl)) fmt = InstantFmt.Short;
  }
  if (isTimeLike(dl)) {
    if (isTime(dl)) {
      fmt = hour12 ? TimeFmt.Short12h : TimeFmt.Short24h;
    }
  }

  return dl.toLocaleString(locales, fmt);
}

export function fmtMedium(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[]; hour12?: boolean },
): string {
  const { locales = config.getLocales(), hour12 = false } = opts || {};
  let fmt;
  if (isDateLike(dl)) {
    if (isDate(dl)) fmt = DateFmt.Medium;
    if (isDateTime(dl))
      fmt = hour12 ? DateTimeFmt.Medium12h : DateTimeFmt.Medium24h;
    if (isZoned(dl)) fmt = hour12 ? ZonedFmt.Medium12h : ZonedFmt.Medium24h;
    if (isInstant(dl)) fmt = InstantFmt.Medium;
  }
  if (isTimeLike(dl)) {
    if (isTime(dl)) {
      fmt = hour12 ? TimeFmt.Short12h : TimeFmt.Short24h; // Medium same as Short for time
    }
  }

  return dl.toLocaleString(locales, fmt);
}

export function fmtLong(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[]; hour12?: boolean },
): string {
  const { locales = config.getLocales(), hour12 = false } = opts || {};
  let fmt;
  if (isDateLike(dl)) {
    if (isDate(dl)) fmt = DateFmt.Long;
    if (isDateTime(dl))
      fmt = hour12 ? DateTimeFmt.Long12h : DateTimeFmt.Long24h;
    if (isZoned(dl)) fmt = hour12 ? ZonedFmt.Long12h : ZonedFmt.Long24h;
    if (isInstant(dl)) fmt = InstantFmt.Long;
  }
  if (isTimeLike(dl)) {
    if (isTime(dl)) {
      fmt = hour12 ? TimeFmt.Long12h : TimeFmt.Long24h;
    }
  }

  return dl.toLocaleString(locales, fmt);
}
