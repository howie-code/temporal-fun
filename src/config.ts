import { WeekStartsOn } from "./types";

let defaultLocales: string | string[] | undefined;
let defaultWeekStart: WeekStartsOn = 7; // Sunday

export function setLocales(locales: string | string[]) {
  defaultLocales = locales;
  const firstLocale = typeof locales === "string" ? locales : locales[0]!;
  const loc = new Intl.Locale(firstLocale);

  // Guard against getWeekInfo not being available
  if ("getWeekInfo" in loc && typeof loc.getWeekInfo === "function") {
    defaultWeekStart = (loc as any).getWeekInfo().firstDay as WeekStartsOn;
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
