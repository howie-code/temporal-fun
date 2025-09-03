import * as config from "./config";
import type { Zoned } from "./types";

export interface TimezoneFormatOptions {
  locales: Intl.LocalesArgument;
  style: Intl.DateTimeFormatOptions["timeZoneName"];
}

export function getAllTimezones(): string[] {
  return Intl.supportedValuesOf("timeZone");
}

/**
 * Check if timezone is valid using Intl API
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get timezone name (or abbreviation) from Intl.DateTimeFormat
 * This is locale-specific and varies based on date (e.g., London is BST or GMT)
 */
export function getTimezoneName(
  zonedDateTime: Zoned,
  options?: Partial<TimezoneFormatOptions>,
): string | null {
  const defaultOptions: TimezoneFormatOptions = {
    locales: config.getLocales(),
    style: "short",
  };
  const mergedOptions: TimezoneFormatOptions = {
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
 * Get GMT offset string for a timezone
 */
export function getGMTOffset(currentTimeOffsetInMinutes: number): string {
  const hours = Math.trunc(currentTimeOffsetInMinutes / 60);
  const minutes = Math.abs(currentTimeOffsetInMinutes) % 60;
  const sign = hours >= 0 ? "+" : "-";
  return `GMT${sign}${Math.abs(hours)}:${minutes.toString().padStart(2, "0")}`;
}
