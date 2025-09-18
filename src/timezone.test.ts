import { beforeEach, describe, expect, it } from "bun:test";
import * as config from "./config";
import { getGMTOffset, getTimezoneName, isValidTimezone } from "./timezone.js";
import { Zoned } from "./types";

describe("isValidTimezone()", () => {
  it("returns true for valid timezone strings", () => {
    expect(isValidTimezone("UTC")).toBe(true);
    expect(isValidTimezone("America/New_York")).toBe(true);
    expect(isValidTimezone("Europe/London")).toBe(true);
    expect(isValidTimezone("Asia/Tokyo")).toBe(true);
    expect(isValidTimezone("America/Los_Angeles")).toBe(true);
  });

  it("returns false for invalid timezone strings", () => {
    expect(isValidTimezone("Invalid/Timezone")).toBe(false);
    expect(isValidTimezone("America/NonExistent")).toBe(false);
    expect(isValidTimezone("NotATimezone")).toBe(false);
  });

  it("handles edge cases", () => {
    expect(isValidTimezone("")).toBe(false);
    expect(isValidTimezone("   ")).toBe(false);
    expect(isValidTimezone("America/New York")).toBe(false); // Space instead of underscore
  });
});

describe("getTimezoneName()", () => {
  beforeEach(() => {
    config.setLocales("en-US");
  });

  it("returns timezone names for different zones with default options", () => {
    const utcDate = Zoned.from("2024-07-15T12:00:00[UTC]");
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");
    const londonDate = Zoned.from("2024-07-15T12:00:00[Europe/London]");

    expect(getTimezoneName(utcDate)).toBe("UTC");
    expect(getTimezoneName(nyDate)).toBe("EDT");
    expect(getTimezoneName(londonDate)).toBe("GMT+1");
    expect(getTimezoneName(londonDate, { locales: "en-GB" })).toBe("BST");
  });

  it("returns different names for winter vs summer (DST)", () => {
    const winterDate = Zoned.from("2024-01-15T12:00:00[America/New_York]");
    const summerDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    expect(getTimezoneName(winterDate)).toBe("EST");
    expect(getTimezoneName(summerDate)).toBe("EDT");
  });

  it("respects locale option", () => {
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    const usResult = getTimezoneName(nyDate, { locales: "en-US" });
    const frResult = getTimezoneName(nyDate, { locales: "fr-FR" });

    expect(usResult).toBe("EDT");
    expect(frResult).toBe("UTC−4");
  });

  it("respects style option", () => {
    const nyDate = Zoned.from("2024-07-15T12:00:00[America/New_York]");

    const shortResult = getTimezoneName(nyDate, { style: "short" });
    const longResult = getTimezoneName(nyDate, { style: "long" });

    expect(shortResult).toBe("EDT");
    expect(longResult).toBe("Eastern Daylight Time");
  });

  it("works with different style options", () => {
    const londonDate = Zoned.from("2024-01-15T12:00:00[Europe/London]");

    const shortResult = getTimezoneName(londonDate, { style: "short" });
    const longResult = getTimezoneName(londonDate, { style: "long" });
    const shortOffsetResult = getTimezoneName(londonDate, {
      style: "shortOffset",
    });
    const longOffsetResult = getTimezoneName(londonDate, {
      style: "longOffset",
    });

    expect(shortResult).toBe("GMT");
    expect(longResult).toBe("Greenwich Mean Time");
    expect(shortOffsetResult).toBe("GMT");
    expect(longOffsetResult).toBe("GMT");
  });

  it("combines locale and style options", () => {
    const parisDate = Zoned.from("2024-07-15T12:00:00[Europe/Paris]");

    const result = getTimezoneName(parisDate, {
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
    const result1 = getTimezoneName(utcDate);
    expect(result1).toBe("UTC");

    // Test with empty options object
    const result2 = getTimezoneName(utcDate, {});
    expect(result2).toBe("UTC");
  });
});

describe("getGMTOffset()", () => {
  it("formats positive offsets correctly", () => {
    expect(getGMTOffset(300)).toBe("GMT+5:00");
    expect(getGMTOffset(120)).toBe("GMT+2:00");
    expect(getGMTOffset(60)).toBe("GMT+1:00");
  });

  it("formats negative offsets correctly", () => {
    expect(getGMTOffset(-300)).toBe("GMT-5:00");
    expect(getGMTOffset(-120)).toBe("GMT-2:00");
    expect(getGMTOffset(-60)).toBe("GMT-1:00");
  });

  it("formats zero offset correctly", () => {
    expect(getGMTOffset(0)).toBe("GMT+0:00");
  });

  it("formats fractional hour offsets correctly", () => {
    expect(getGMTOffset(330)).toBe("GMT+5:30");
    expect(getGMTOffset(-330)).toBe("GMT-5:30");
    expect(getGMTOffset(570)).toBe("GMT+9:30");
    expect(getGMTOffset(-570)).toBe("GMT-9:30");
  });

  it("handles edge cases with large offsets", () => {
    expect(getGMTOffset(720)).toBe("GMT+12:00");
    expect(getGMTOffset(-720)).toBe("GMT-12:00");
    expect(getGMTOffset(840)).toBe("GMT+14:00");
    expect(getGMTOffset(-660)).toBe("GMT-11:00");
  });

  it("pads minutes correctly", () => {
    expect(getGMTOffset(65)).toBe("GMT+1:05");
    expect(getGMTOffset(-65)).toBe("GMT-1:05");
    expect(getGMTOffset(125)).toBe("GMT+2:05");
  });
});
