import * as config from "./config";
import { nowZoned, zoned } from "./convert";
import { isDateLike, isInstant, isTimeLike, isZoned } from "./guards";
import type { DateLike, Instant, TimeLike, Zoned } from "./types";

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

const TIME_PART_TYPES = new Set<Intl.DateTimeFormatPartTypes>([
  "hour",
  "minute",
  "second",
  "dayPeriod",
  "fractionalSecond",
]);

// Render a Zoned/Instant with a CLDR date/time style plus the descriptive per-tier
// zone name. Intl throws when dateStyle/timeStyle is combined with timeZoneName, so
// we format the body and splice the zone name into the spot CLDR would place it —
// locale-dependent: zh-CN, for one, puts the zone between the date and the time.
function fmtZonedStyled(
  dl: Zoned | Instant,
  locales: Intl.LocalesArgument,
  styleOpts: Intl.DateTimeFormatOptions,
  tzStyle: Intl.DateTimeFormatOptions["timeZoneName"],
): string {
  const date = new Date(dl.epochMilliseconds);
  const timeZone = isZoned(dl) ? dl.timeZoneId : "UTC";

  const bodyParts = new Intl.DateTimeFormat(locales, { ...styleOpts, timeZone }).formatToParts(
    date,
  );
  const body = bodyParts.map((p) => p.value);

  const tzName = new Intl.DateTimeFormat(locales, { timeZone, timeZoneName: tzStyle })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;
  if (!tzName) return body.join("");

  const { side, separator } = probeZoneAttachment(locales, tzStyle, timeZone);

  // The zone attaches to the time, so splice it adjacent to the run of time parts.
  const firstTime = bodyParts.findIndex((p) => TIME_PART_TYPES.has(p.type));
  if (firstTime === -1) return [...body, separator + tzName].join("");

  let lastTime = firstTime;
  for (let i = firstTime + 1; i < bodyParts.length; i++) {
    const type = bodyParts[i]?.type;
    if (type && (TIME_PART_TYPES.has(type) || type === "literal")) lastTime = i;
    else break;
  }
  // A trailing literal belongs to whatever follows the time, not to the time run.
  while (lastTime > firstTime && bodyParts[lastTime]?.type === "literal") lastTime--;

  if (side === "before") body.splice(firstTime, 0, tzName + separator);
  else body.splice(lastTime + 1, 0, separator + tzName);
  return body.join("");
}

// Which side of the time CLDR places the zone, and the literal separator between
// them. Probes with hour+minute so the separator is the real time/zone joiner, not
// a locale hour-unit marker (ja `時`, fi/hu `h`) that a bare-hour probe mis-captures.
function probeZoneAttachment(
  locales: Intl.LocalesArgument,
  tzStyle: Intl.DateTimeFormatOptions["timeZoneName"],
  timeZone: string,
): { side: "before" | "after"; separator: string } {
  const parts = new Intl.DateTimeFormat(locales, {
    hour: "numeric",
    minute: "numeric",
    timeZoneName: tzStyle,
    timeZone,
  }).formatToParts(new Date());

  const zoneIdx = parts.findIndex((p) => p.type === "timeZoneName");
  const timeIdx = parts.findIndex((p) => TIME_PART_TYPES.has(p.type));
  if (zoneIdx === -1 || timeIdx === -1) return { side: "after", separator: " " };

  const side = zoneIdx < timeIdx ? "before" : "after";
  const sepPart = side === "before" ? parts[zoneIdx + 1] : parts[zoneIdx - 1];
  return { side, separator: sepPart?.type === "literal" ? sepPart.value : "" };
}

export function fmtShort(dl: DateLike | TimeLike, locales?: Intl.LocalesArgument): string {
  const loc = locales ?? config.getLocales();
  const locStr = loc?.toString();

  if (isZoned(dl) || isInstant(dl)) {
    return fmtZonedStyled(dl, loc, { dateStyle: "short", timeStyle: "short" }, "short");
  }

  const fmtOpts: Intl.DateTimeFormatOptions = {};
  if (isDateLike(dl)) fmtOpts.dateStyle = "short";
  if (isTimeLike(dl)) fmtOpts.timeStyle = "short";
  return dl.toLocaleString(locStr, fmtOpts);
}

export function fmtMedium(dl: DateLike | TimeLike, locales?: Intl.LocalesArgument): string {
  const loc = locales ?? config.getLocales();
  const locStr = loc?.toString();

  if (isZoned(dl) || isInstant(dl)) {
    return fmtZonedStyled(dl, loc, { dateStyle: "medium", timeStyle: "short" }, "short");
  }

  const fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "medium";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = fmtOpts.dateStyle ? "short" : "medium";
  }
  return dl.toLocaleString(locStr, fmtOpts);
}

export function fmtLong(dl: DateLike | TimeLike, locales?: Intl.LocalesArgument): string {
  const loc = locales ?? config.getLocales();
  const locStr = loc?.toString();

  if (isZoned(dl) || isInstant(dl)) {
    return fmtZonedStyled(dl, loc, { dateStyle: "long", timeStyle: "short" }, "long");
  }

  const fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "long";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = fmtOpts.dateStyle ? "short" : "long";
  }
  return dl.toLocaleString(locStr, fmtOpts);
}

export function fmtFull(dl: DateLike | TimeLike, locales?: Intl.LocalesArgument): string {
  const loc = locales ?? config.getLocales();
  const locStr = loc?.toString();

  const fmtOpts = {} as Intl.DateTimeFormatOptions;
  if (isDateLike(dl)) {
    fmtOpts.dateStyle = "full";
  }
  if (isTimeLike(dl)) {
    fmtOpts.timeStyle = "full";
  }
  if (isInstant(dl)) {
    fmtOpts.timeZone = "UTC";
  }

  return dl.toLocaleString(locStr, fmtOpts);
}
