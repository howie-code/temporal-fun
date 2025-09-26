import type { WeekStartsOn } from "./types";

let defaultLocales: Intl.LocalesArgument | undefined;
let defaultWeekStart: WeekStartsOn = 7; // Sunday

export function setLocales(locales: Intl.LocalesArgument) {
  defaultLocales = locales;
  const firstLocale = Array.isArray(locales) ? locales[0] : locales;
  if (!firstLocale) {
    defaultLocales = undefined;
    return;
  }

  const loc = new Intl.Locale(firstLocale);

  // Guard against getWeekInfo not being available
  if ("getWeekInfo" in loc && typeof loc.getWeekInfo === "function") {
    defaultWeekStart = loc.getWeekInfo().firstDay as WeekStartsOn;
  }
}

export function setWeekStart(weekStart: WeekStartsOn) {
  defaultWeekStart = weekStart;
}

export function getLocales() {
  return defaultLocales;
}

export function getWeekStart() {
  return defaultWeekStart;
}

export function autodetectLocale() {
  const detectedLocale =
    typeof navigator !== "undefined"
      ? navigator.language
      : Intl.DateTimeFormat().resolvedOptions().locale;
  setLocales(detectedLocale);
}
