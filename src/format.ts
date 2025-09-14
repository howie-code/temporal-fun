import { DateLike, PlainDate, PlainTime, TimeLike, Zoned } from "./types";
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
import { getTimezoneName } from "./timezone";

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

// Helper to identify locale-specific separator (if any) to include between the time and timezone components
//
// Why? Because we want to format Zoned with a CLDR timeStyle and timezone component
// - timeStyle="short" doens't render a timezone
// - CLDR timeStyles can't be used in combination with timeZoneName
//
// So instead we format Zoned without the timezone, then get the locale timezone
// and use this helper to determine any separators to use
//
// This works by using formatToParts with a locale-aware hour + timezone format.
// We then find the timeZoneName component and determine if there is a literal separator part before it.
function getLocaleTimeZoneJoiner(locales?: string | string[]): string {
  // Include hour to ensure the timezone actually appears after a time part
  const parts = new Intl.DateTimeFormat(locales, {
    hour: "numeric",
    timeZoneName: "short",
  }).formatToParts(new Date());

  const tzIndex = parts.findIndex((p) => p.type === "timeZoneName");
  if (tzIndex === -1) return " "; // fallback

  const preceding = parts[tzIndex - 1];
  // If the preceding part is a literal that includes whitespace, use that as separator
  if (preceding?.type === "literal") {
    return preceding.value;
  }

  return ""; // no separator
}

export function fmtShort(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[] },
): string {
  const { locales = config.getLocales() } = opts || {};

  const fmtOpts: Intl.DateTimeFormatOptions = {};
  if (isDateLike(dl)) fmtOpts.dateStyle = "short";
  if (isTimeLike(dl)) fmtOpts.timeStyle = "short";
  if (isInstant(dl)) fmtOpts.timeZone = "UTC";

  if (!isZoned(dl) && !isInstant(dl)) {
    return dl.toLocaleString(locales, fmtOpts);
  }

  const dtString = dl.toLocaleString(locales, fmtOpts);
  const tzName = isZoned(dl)
    ? getTimezoneName(dl, { locales, style: "short" })
    : "UTC";
  return tzName
    ? [dtString, getLocaleTimeZoneJoiner(locales), tzName].join("")
    : dtString;
}

export function fmtMedium(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[] },
): string {
  const { locales = config.getLocales() } = opts || {};
  let fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "medium";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = fmtOpts.dateStyle ? "short" : "medium";
  }
  if (isInstant(dl)) {
    fmtOpts.timeZone = "UTC";
  }

  if (!isZoned(dl) && !isInstant(dl)) {
    return dl.toLocaleString(locales, fmtOpts);
  }

  const dtString = dl.toLocaleString(locales, fmtOpts);
  const tzName = isZoned(dl)
    ? getTimezoneName(dl, { locales, style: "short" })
    : "UTC";
  return tzName
    ? [dtString, getLocaleTimeZoneJoiner(locales), tzName].join("")
    : dtString;
}

export function fmtLong(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[] },
): string {
  const { locales = config.getLocales() } = opts || {};
  let fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "long";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = fmtOpts.dateStyle ? "short" : "long";
  }

  if (!isZoned(dl) && !isInstant(dl)) {
    return dl.toLocaleString(locales, fmtOpts);
  }

  if (isInstant(dl)) {
    fmtOpts.timeZone = "UTC";
  }

  const dtString = dl.toLocaleString(locales, fmtOpts);
  const tzName = isZoned(dl)
    ? getTimezoneName(dl, { locales, style: "long" })
    : "UTC";
  return tzName
    ? [dtString, getLocaleTimeZoneJoiner(locales), tzName].join("")
    : dtString;
}

export function fmtFull(
  dl: DateLike | TimeLike,
  opts?: { locales?: string | string[] },
): string {
  const { locales = config.getLocales() } = opts || {};
  let fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "full";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = "full";
  }
  if (isInstant(dl)) {
    fmtOpts.timeZone = "UTC";
  }

  return dl.toLocaleString(locales, fmtOpts);
}
