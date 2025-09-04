import { describe, it, expect } from "vitest";
import { PlainDate, PlainDateTime, PlainTime, Instant, Zoned } from "./types";
import {
  parseDate,
  parseDateTime,
  parseZoned,
  parseTime,
  parseInstant,
  parseDateLike,
  parseTimeLike,
  isValidInstantString,
  isValidDateString,
  isValidDateTimeString,
  isValidTimeString,
  isValidZonedString,
} from "./parse";

describe("Parsing functions", () => {
  describe("parseDate()", () => {
    it("should parse standard date strings", () => {
      const result = parseDate("2024-03-15");
      expect(result).toBeInstanceOf(PlainDate);
      expect(result.toString()).toBe("2024-03-15");
    });

    it("should handle leap year dates", () => {
      const result = parseDate("2024-02-29");
      expect(result.toString()).toBe("2024-02-29");
    });

    it("should throw for invalid date strings", () => {
      expect(() => parseDate("invalid-date")).toThrow();
      expect(() => parseDate("2024-13-15")).toThrow();
      expect(() => parseDate("2024-02-30")).toThrow();
    });
  });

  describe("parseDateTime()", () => {
    it("should parse standard datetime strings", () => {
      const result = parseDateTime("2024-03-15T14:30:00");
      expect(result).toBeInstanceOf(PlainDateTime);
      expect(result.toString()).toBe("2024-03-15T14:30:00");
    });

    it("should parse datetime with space separator", () => {
      const result = parseDateTime("2024-03-15 14:30:00");
      expect(result).toBeInstanceOf(PlainDateTime);
      expect(result.toString()).toBe("2024-03-15T14:30:00");
    });

    it("should parse datetime without seconds", () => {
      const result = parseDateTime("2024-03-15T14:30");
      expect(result).toBeInstanceOf(PlainDateTime);
      expect(result.toString()).toBe("2024-03-15T14:30:00");
    });

    it("should parse datetime with milliseconds", () => {
      const result = parseDateTime("2024-03-15T14:30:45.123");
      expect(result).toBeInstanceOf(PlainDateTime);
      expect(result.millisecond).toBe(123);
    });

    it("should throw for invalid datetime strings", () => {
      expect(() => parseDateTime("invalid-datetime")).toThrow();
      expect(() => parseDateTime("2024-03-15T25:30:00")).toThrow();
      expect(() => parseDateTime("2024-03-15T14:70:00")).toThrow();
    });
  });

  describe("parseZoned()", () => {
    it("should parse standard zoned datetime strings", () => {
      const result = parseZoned("2024-03-15T14:30:00[America/New_York]");
      expect(result).toBeInstanceOf(Zoned);
      expect(result.timeZoneId).toBe("America/New_York");
    });

    it("should parse zoned datetime with offset", () => {
      const result = parseZoned("2024-03-15T14:30:00-05:00[America/New_York]");
      expect(result).toBeInstanceOf(Zoned);
      expect(result.timeZoneId).toBe("America/New_York");
    });

    it("should parse zoned datetime with UTC", () => {
      const result = parseZoned("2024-03-15T14:30:00Z[UTC]");
      expect(result).toBeInstanceOf(Zoned);
      expect(result.timeZoneId).toBe("UTC");
    });

    it("should handle fallback parsing for malformed timezone strings", () => {
      // This tests the robust parsing mentioned in existing tests
      const result = parseZoned("2024-03-15T14:30:00Z[America/New_York]");
      expect(result).toBeInstanceOf(Zoned);
      expect(result.timeZoneId).toBe("America/New_York");
    });

    it("should throw for invalid timezone strings", () => {
      expect(() =>
        parseZoned("2024-03-15T14:30:00[Invalid/Timezone]"),
      ).toThrow();
      expect(() => parseZoned("invalid-zoned")).toThrow();
    });
  });

  describe("parseTime()", () => {
    it("should parse standard time strings", () => {
      const result = parseTime("14:30:00");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.toString()).toBe("14:30:00");
    });

    it("should parse time without seconds", () => {
      const result = parseTime("14:30");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.toString()).toBe("14:30:00");
    });

    it("should parse time with milliseconds", () => {
      const result = parseTime("14:30:45.123");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.millisecond).toBe(123);
    });

    it("should throw for invalid time strings", () => {
      expect(() => parseTime("9.5")).toThrow();
      expect(() => parseTime("25:30")).toThrow();
      expect(() => parseTime("14:70")).toThrow();
      expect(() => parseTime("invalid-time")).toThrow();
    });

    it("should parse 12-hour format with AM", () => {
      const result = parseTime("2:30 AM");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.hour).toBe(2);
      expect(result.minute).toBe(30);
    });

    it("should parse 12-hour format with PM", () => {
      const result = parseTime("2:30 PM");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.hour).toBe(14);
      expect(result.minute).toBe(30);
    });

    it("should handle 12 AM (midnight)", () => {
      const result = parseTime("12:00 AM");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
    });

    it("should handle 12 PM (noon)", () => {
      const result = parseTime("12:00 PM");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.hour).toBe(12);
      expect(result.minute).toBe(0);
    });

    it("should parse without spaces", () => {
      const result = parseTime("2:30pm");
      expect(result).toBeInstanceOf(PlainTime);
      expect(result.hour).toBe(14);
    });

    it("should throw for invalid 12-hour time strings", () => {
      expect(() => parseTime("13:30 AM")).toThrow(); // 13 is invalid in 12-hour
      expect(() => parseTime("2:70 PM")).toThrow(); // Invalid minutes
      expect(() => parseTime("invalid")).toThrow();
    });
  });

  describe("parseInstant()", () => {
    it("should parse ISO instant strings", () => {
      const result = parseInstant("2024-03-15T14:30:00Z");
      expect(result).toBeInstanceOf(Instant);
    });

    it("should parse instant with milliseconds", () => {
      const result = parseInstant("2024-03-15T14:30:00.123Z");
      expect(result).toBeInstanceOf(Instant);
      expect(result.epochMilliseconds % 1000).toBe(123);
    });

    it("should parse instant with offset", () => {
      const result = parseInstant("2024-03-15T14:30:00-05:00");
      expect(result).toBeInstanceOf(Instant);
    });

    it("should throw for invalid instant strings", () => {
      expect(() => parseInstant("invalid-instant")).toThrow();
      expect(() => parseInstant("")).toThrow();
    });
  });

  describe("parseDateLike()", () => {
    it("should return PlainDate for date-only strings", () => {
      const result = parseDateLike("2024-03-15");
      expect(result).toBeInstanceOf(PlainDate);
    });

    it("should return PlainDateTime for datetime strings", () => {
      const result = parseDateLike("2024-03-15T14:30:00");
      expect(result).toBeInstanceOf(PlainDateTime);
    });

    it("should return Zoned for zoned datetime strings", () => {
      const result = parseDateLike("2024-03-15T14:30:00[America/New_York]");
      expect(result).toBeInstanceOf(Zoned);
    });

    it("should return Instant for instant strings", () => {
      const result = parseDateLike("2024-03-15T14:30:00Z");
      expect(result).toBeInstanceOf(Instant);
    });

    it("should throw for invalid date-like strings", () => {
      expect(() => parseDateLike("invalid-date")).toThrow();
    });
  });

  describe("parseTimeLike()", () => {
    it("should return PlainTime for time-only strings", () => {
      const result = parseTimeLike("14:30:00");
      expect(result).toBeInstanceOf(PlainTime);
    });

    it("should return PlainDateTime for datetime strings", () => {
      const result = parseTimeLike("2024-03-15T14:30:00");
      expect(result).toBeInstanceOf(PlainDateTime);
    });

    it("should return Zoned for zoned datetime strings", () => {
      const result = parseTimeLike("2024-03-15T14:30:00[America/New_York]");
      expect(result).toBeInstanceOf(Zoned);
    });

    it("should return Instant for instant strings", () => {
      const result = parseTimeLike("2024-03-15T14:30:00Z");
      expect(result).toBeInstanceOf(Instant);
    });

    it("should handle 12-hour format", () => {
      const result = parseTimeLike("2:30 PM");
      expect(result).toBeInstanceOf(PlainTime);
      expect((result as PlainTime).hour).toBe(14);
    });

    it("should throw for invalid time-like strings", () => {
      expect(() => parseTimeLike("invalid-time")).toThrow();
    });
  });
});

describe("Validation functions", () => {
  describe("isValidDateString", () => {
    it("should validate correct PlainDate strings", () => {
      expect(isValidDateString("2024-03-15")).toBe(true);
      expect(isValidDateString("2020-02-29")).toBe(true); // leap year
    });

    it("should reject invalid PlainDate strings", () => {
      expect(isValidDateString("2024-13-15")).toBe(false); // invalid month
      expect(isValidDateString("2024-02-30")).toBe(false); // invalid day
      expect(isValidDateString("not-a-date")).toBe(false);
      expect(isValidDateString("")).toBe(false);
    });
  });

  describe("isValidDateTimeString", () => {
    it("should validate correct PlainDateTime strings", () => {
      expect(isValidDateTimeString("2024-03-15T14:30:00")).toBe(true);
      expect(isValidDateTimeString("2024-03-15 14:30:00")).toBe(true);
      expect(isValidDateTimeString("2024-03-15T14:30")).toBe(true);
    });

    it("should reject invalid PlainDateTime strings", () => {
      expect(isValidDateTimeString("2024-03-15T25:30:00")).toBe(false); // invalid hour
      expect(isValidDateTimeString("not-a-datetime")).toBe(false);
    });
  });

  describe("isValidZonedString", () => {
    it("should validate correct ZonedDateTime strings", () => {
      expect(isValidZonedString("2024-03-15T14:30:00[America/New_York]")).toBe(
        true,
      );
      expect(
        isValidZonedString("2024-03-15T14:30:00+05:00[Asia/Karachi]"),
      ).toBe(true);
    });

    it("should reject invalid ZonedDateTime strings", () => {
      expect(isValidZonedString("2024-03-15T14:30:00[Invalid/Timezone]")).toBe(
        false,
      );
      expect(isValidZonedString("not-a-zdt")).toBe(false);
    });
  });

  describe("isValidTimeString", () => {
    it("should validate correct PlainTime strings", () => {
      expect(isValidTimeString("14:30:00")).toBe(true);
      expect(isValidTimeString("14:30")).toBe(true);
      expect(isValidTimeString("2:30pm")).toBe(true);
    });

    it("should reject invalid PlainTime strings", () => {
      expect(isValidTimeString("9.5")).toBe(false);
      expect(isValidTimeString("25:30")).toBe(false); // invalid hour
      expect(isValidTimeString("not-a-time")).toBe(false);
    });
  });

  describe("isValidInstantString", () => {
    it("should validate correct Instant strings", () => {
      expect(isValidInstantString("2024-03-15T14:30:00Z")).toBe(true);
      expect(isValidInstantString("2024-03-15T14:30:00.123Z")).toBe(true);
    });

    it("should reject invalid Instant strings", () => {
      expect(isValidInstantString("2024-03-15")).toBe(false);
      expect(isValidInstantString("March 15, 2024")).toBe(false);
      expect(isValidInstantString("not-a-date")).toBe(false);
      expect(isValidInstantString("")).toBe(false);
    });
  });
});
