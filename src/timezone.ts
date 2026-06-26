import * as config from "./config";
import type { Zoned } from "./types";

export interface TzFormatOptions {
  locales: Intl.LocalesArgument;
  style: Intl.DateTimeFormatOptions["timeZoneName"];
}

export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf("timeZone");
}

/**
 * Check if timezone is valid using Intl API
 */
export function isValidTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone name (or abbreviation) from Intl.DateTimeFormat
 * This is locale-specific and varies based on date (e.g., London is BST or GMT)
 */
export function fmtTz(zonedDateTime: Zoned, options?: Partial<TzFormatOptions>): string | null {
  const defaultOptions: TzFormatOptions = {
    locales: config.getLocales(),
    style: "short",
  };
  const mergedOptions: TzFormatOptions = {
    ...defaultOptions,
    ...options,
  };

  const date = new Date(zonedDateTime.epochMilliseconds);
  const formatter = new Intl.DateTimeFormat(mergedOptions.locales, {
    timeZone: zonedDateTime.timeZoneId,
    timeZoneName: mergedOptions.style,
  });

  const parts = formatter.formatToParts(date);
  const timeZonePart = parts.find((part) => part.type === "timeZoneName");
  return timeZonePart?.value ?? null;
}

/**
 * Get GMT offset string (e.g. "GMT+5:30") for a ZonedDateTime
 */
export function tzOffset(zdt: Zoned): string {
  const totalMinutes = tzOffsetMinutes(zdt);
  const hours = Math.trunc(totalMinutes / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const sign = hours >= 0 ? "+" : "-";
  return `GMT${sign}${Math.abs(hours)}:${minutes.toString().padStart(2, "0")}`;
}

export function tzOffsetMinutes(zdt: Zoned): number {
  return zdt.offsetNanoseconds / (1e9 * 60);
}
