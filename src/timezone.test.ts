import { beforeEach, describe, expect, it } from "bun:test";
import * as config from "./config";
import { fmtTz, isValidTz, tzOffset, tzOffsetMinutes } from "./timezone.js";
import { Zoned } from "./types";

describe("isValidTz()", () => {
  it("returns true for valid timezone strings", () => {
    expect(isValidTz("UTC")).toBe(true);
    expect(isValidTz("America/New_York")).toBe(true);
    expect(isValidTz("Europe/London")).toBe(true);
    expect(isValidTz("Asia/Tokyo")).toBe(true);
    expect(isValidTz("America/Los_Angeles")).toBe(true);
  });

  it("returns false for invalid timezone strings", () => {
    expect(isValidTz("Invalid/Timezone")).toBe(false);
    expect(isValidTz("America/NonExistent")).toBe(false);
    expect(isValidTz("NotATimezone")).toBe(false);
  });

  it("handles edge cases", () => {
    expect(isValidTz("")).toBe(false);
    expect(isValidTz("   ")).toBe(false);
    expect(isValidTz("America/New York")).toBe(false); // Space instead of underscore
  });
});

describe("fmtTz()", () => {
  beforeEach(() => {
    config.setLocales("en-US");
  });

  it("returns timezone names for different zones with default options", () => {
    const utcDate = Zoned.from("2024-07-15T12:00:00[UTC]");
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");
    const londonDate = Zoned.from("2024-07-15T12:00:00[Europe/London]");

    expect(fmtTz(utcDate)).toBe("UTC");
    expect(fmtTz(nyDate)).toBe("EDT");
    expect(fmtTz(londonDate)).toBe("GMT+1");
    expect(fmtTz(londonDate, { locales: "en-GB" })).toBe("BST");
  });

  it("returns different names for winter vs summer (DST)", () => {
    const winterDate = Zoned.from("2024-01-15T12:00:00[America/New_York]");
    const summerDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    expect(fmtTz(winterDate)).toBe("EST");
    expect(fmtTz(summerDate)).toBe("EDT");
  });

  it("respects locale option", () => {
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    const usResult = fmtTz(nyDate, { locales: "en-US" });
    const frResult = fmtTz(nyDate, { locales: "fr-FR" });

    expect(usResult).toBe("EDT");
    expect(frResult).toBe("UTC−4");
  });

  it("respects style option", () => {
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    const shortResult = fmtTz(nyDate, { style: "short" });
    const longResult = fmtTz(nyDate, { style: "long" });

    expect(shortResult).toBe("EDT");
    expect(longResult).toBe("Eastern Daylight Time");
  });

  it("combines locale and style options", () => {
    const parisDate = Zoned.from("2024-07-15T12:00:00[Europe/Paris]");

    const result = fmtTz(parisDate, {
      locales: "fr-FR",
      style: "long",
    });

    expect(typeof result).toBe("string");
    expect(result).not.toBe("");
    // French locale should return French timezone name
    expect(result).toMatch(/heure/i); // Should contain "heure" (French for "time")
  });

  it("handles edge cases gracefully", () => {
    const utcDate = Zoned.from("2024-01-01T00:00:00[UTC]");

    // Test with undefined options
    const result1 = fmtTz(utcDate);
    expect(result1).toBe("UTC");

    // Test with empty options object
    const result2 = fmtTz(utcDate, {});
    expect(result2).toBe("UTC");
  });
});

describe("tzOffset()", () => {
  it("formats positive offsets correctly", () => {
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Asia/Dubai]"))).toBe("GMT+4:00");
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Europe/Berlin]"))).toBe("GMT+2:00");
  });

  it("formats negative offsets correctly", () => {
    expect(tzOffset(Zoned.from("2024-01-15T12:00:00[America/New_York]"))).toBe("GMT-5:00");
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[America/New_York]"))).toBe("GMT-4:00");
  });

  it("formats zero offset correctly", () => {
    expect(tzOffset(Zoned.from("2024-01-01T00:00:00[UTC]"))).toBe("GMT+0:00");
  });

  it("formats fractional hour offsets correctly", () => {
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Asia/Kolkata]"))).toBe("GMT+5:30");
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Australia/Darwin]"))).toBe("GMT+9:30");
  });

  it("handles large offsets", () => {
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Pacific/Kiritimati]"))).toBe("GMT+14:00");
    expect(tzOffset(Zoned.from("2024-07-15T12:00:00[Etc/GMT+12]"))).toBe("GMT-12:00");
  });

  // Offset time zones exercise minute padding and the sub-hour sign edge that
  // no IANA zone produces today.
  it("pads single-digit minutes", () => {
    expect(tzOffset(Zoned.from("2024-01-01T00:00:00+00:05[+00:05]"))).toBe("GMT+0:05");
    expect(tzOffset(Zoned.from("2024-01-01T00:00:00-00:05[-00:05]"))).toBe("GMT-0:05");
  });

  it("signs sub-hour negative offsets correctly", () => {
    expect(tzOffset(Zoned.from("2024-01-01T00:00:00-00:30[-00:30]"))).toBe("GMT-0:30");
  });
});

describe("tzOffsetMinutes()", () => {
  it("returns whole-minute offsets for IANA zones", () => {
    expect(tzOffsetMinutes(Zoned.from("2024-01-15T12:00:00[UTC]"))).toBe(0);
    expect(tzOffsetMinutes(Zoned.from("2024-01-15T12:00:00[America/New_York]"))).toBe(-300);
    expect(tzOffsetMinutes(Zoned.from("2024-07-15T12:00:00[Asia/Kolkata]"))).toBe(330);
    expect(tzOffsetMinutes(Zoned.from("2024-07-15T12:00:00[Asia/Kathmandu]"))).toBe(345);
  });

  it("reflects DST shifts", () => {
    expect(tzOffsetMinutes(Zoned.from("2024-01-15T12:00:00[America/New_York]"))).toBe(-300);
    expect(tzOffsetMinutes(Zoned.from("2024-07-15T12:00:00[America/New_York]"))).toBe(-240);
  });
});
