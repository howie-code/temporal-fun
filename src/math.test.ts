import { describe, it, expect } from "vitest";
import { Temporal } from "temporal-polyfill";

const END_OF_DAY_TIME = {
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999,
};

import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  stepInterval,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "./math";
import { parseDate, parseDateTime, parseInstant, parseZoned } from "./parse";
import { Instant, PlainDate, PlainDateTime, Zoned } from "./types";

describe("Math functions with DateLike types", () => {
  // Test data for different DateLike types
  const pd = parseDate("2024-03-15");
  const pdt = parseDateTime("2024-03-15T14:30:00");
  const zdt = parseZoned("2024-03-15T14:30:00[America/New_York]");
  const inst = parseInstant("2024-03-15T14:30:00Z");

  describe("startOfDay", () => {
    it("should be no-op for PlainDate", () => {
      const result = startOfDay(pd);
      expect(result).toBe(pd);
    });

    it("should set time to 00:00 for PlainDateTime", () => {
      const result = startOfDay(pdt);
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
      expect(result.millisecond).toBe(0);
    });

    it("should use native startOfDay for ZonedDateTime", () => {
      const result = startOfDay(zdt);
      const expected = zdt.startOfDay();
      expect(Zoned.compare(result, expected)).toBe(0);
    });

    it("should treat Instant as UTC", () => {
      const result = startOfDay(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const expected = utcZdt.startOfDay().toInstant();
      expect(Instant.compare(result, expected)).toBe(0);
    });
  });

  describe("endOfDay", () => {
    it("should return PlainDateTime for PlainDate", () => {
      const result = endOfDay(pd);
      expect(result).toBeInstanceOf(PlainDateTime);
      expect(result.hour).toBe(23);
      expect(result.minute).toBe(59);
      expect(result.second).toBe(59);
      expect(result.millisecond).toBe(999);
    });

    it("should set time to 23:59:59.999 for PlainDateTime", () => {
      const result = endOfDay(pdt);
      expect(result.hour).toBe(23);
      expect(result.minute).toBe(59);
      expect(result.second).toBe(59);
      expect(result.millisecond).toBe(999);
    });

    it("should treat Instant as UTC", () => {
      const result = endOfDay(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const expected = utcZdt.with(END_OF_DAY_TIME).toInstant();
      expect(Instant.compare(result, expected)).toBe(0);
    });
  });

  describe("startOfWeek", () => {
    it("should work with PlainDate", () => {
      const result = startOfWeek(pd); // Friday 2024-03-15
      const expected = parseDate("2024-03-10"); // Sunday
      expect(PlainDate.compare(result, expected)).toBe(0);
    });

    it("should respect weekStartsOn parameter", () => {
      const friday = parseDate("2024-03-15"); // Friday

      // Week starts on Sunday (0)
      const sundayStart = startOfWeek(friday, 0);
      const expectedSunday = parseDate("2024-03-10"); // Sunday
      expect(PlainDate.compare(sundayStart, expectedSunday)).toBe(0);

      // Week starts on Monday (1) - default
      const mondayStart = startOfWeek(friday, 1);
      const expectedMonday = parseDate("2024-03-11"); // Monday
      expect(PlainDate.compare(mondayStart, expectedMonday)).toBe(0);

      // Week starts on Friday (5)
      const fridayStart = startOfWeek(friday, 5);
      expect(PlainDate.compare(fridayStart, friday)).toBe(0); // Same day
    });

    it("should treat Instant as UTC", () => {
      const result = startOfWeek(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const dayOfWeek = utcZdt.dayOfWeek;
      const daysToSubtract = (dayOfWeek + 7 - 0) % 7; // Week starts on Sunday
      const expectedInstant = utcZdt
        .startOfDay()
        .subtract({ days: daysToSubtract })
        .toInstant();
      expect(Instant.compare(result, expectedInstant)).toBe(0);
    });
  });

  describe("startOfMonth", () => {
    it("should set day to 1 for PlainDate", () => {
      const result = startOfMonth(pd);
      expect(result.day).toBe(1);
      expect(result.month).toBe(pd.month);
      expect(result.year).toBe(pd.year);
    });

    it("should treat Instant as UTC", () => {
      const result = startOfMonth(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const expected = utcZdt.with({ day: 1 }).startOfDay().toInstant();
      expect(Instant.compare(result, expected)).toBe(0);
    });
  });

  describe("startOfYear", () => {
    it("should set month and day to 1 for PlainDate", () => {
      const result = startOfYear(pd);
      expect(result.day).toBe(1);
      expect(result.month).toBe(1);
      expect(result.year).toBe(pd.year);
    });
  });

  describe("endOfWeek", () => {
    it("should work with PlainDate", () => {
      const result = endOfWeek(pd); // Friday 2024-03-15
      const expected = parseDateTime("2024-03-16").with(END_OF_DAY_TIME); // Saturday end
      expect(PlainDateTime.compare(result, expected)).toBe(0);
    });

    it("should respect weekStartsOn parameter", () => {
      const friday = parseDate("2024-03-15"); // Friday

      // Week starts on Sunday (0), so ends on Saturday
      const sundayWeekEnd = endOfWeek(friday, 0);
      const expectedSat = parseDateTime("2024-03-16").with(END_OF_DAY_TIME); // Saturday end
      expect(PlainDateTime.compare(sundayWeekEnd, expectedSat)).toBe(0);

      // Week starts on Monday (1), so ends on Sunday - default
      const mondayWeekEnd = endOfWeek(friday, 1);
      const expectedSun = parseDateTime("2024-03-17").with(END_OF_DAY_TIME); // Sunday end
      expect(PlainDateTime.compare(mondayWeekEnd, expectedSun)).toBe(0);
    });

    it("should treat Instant as UTC", () => {
      const result = endOfWeek(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const dayOfWeek = utcZdt.dayOfWeek;
      const daysToAdd = (6 - dayOfWeek + 7) % 7; // Days to Saturday (week ends Saturday when starts Sunday)
      const expectedInstant = utcZdt
        .add({ days: daysToAdd })
        .with(END_OF_DAY_TIME)
        .toInstant();
      expect(Instant.compare(result, expectedInstant)).toBe(0);
    });
  });

  describe("endOfMonth", () => {
    it("should work with PlainDate", () => {
      const result = endOfMonth(pd); // March 2024
      const expected = parseDate("2024-03-31");
      expect(PlainDate.compare(result, expected)).toBe(0);
    });

    it("should handle February in leap year", () => {
      const febDate = parseDate("2024-02-15"); // 2024 is leap year
      const result = endOfMonth(febDate);
      const expected = parseDate("2024-02-29");
      expect(PlainDate.compare(result, expected)).toBe(0);
    });

    it("should handle February in non-leap year", () => {
      const febDate = parseDate("2023-02-15"); // 2023 is not leap year
      const result = endOfMonth(febDate);
      const expected = parseDate("2023-02-28");
      expect(PlainDate.compare(result, expected)).toBe(0);
    });
  });

  describe("endOfYear", () => {
    it("should work with PlainDate", () => {
      const result = endOfYear(pd); // 2024
      const expected = parseDate("2024-12-31");
      expect(PlainDate.compare(result, expected)).toBe(0);
    });

    it("should treat Instant as UTC", () => {
      const result = endOfYear(inst);
      const utcZdt = inst.toZonedDateTimeISO("UTC");
      const expected = utcZdt
        .with({ month: 12, day: 31, ...END_OF_DAY_TIME })
        .toInstant();
      expect(Instant.compare(result, expected)).toBe(0);
    });
  });

  describe("eachOfInterval", () => {
    it("should work with daily increment", () => {
      const start = parseDate("2024-03-15");
      const end = parseDate("2024-03-17");
      const result = stepInterval({ start, end }, { days: 1 });

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(PlainDate);
      expect(PlainDate.compare(result[0]!, start)).toBe(0);
      expect(PlainDate.compare(result[2]!, end)).toBe(0);
    });

    it("should work with weekly increment", () => {
      const start = parseDate("2024-03-01");
      const end = parseDate("2024-03-31");
      const result = stepInterval({ start, end }, { weeks: 1 });

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeInstanceOf(PlainDate);
      result.forEach((date) => {
        expect(date.dayOfWeek).toBe(start.dayOfWeek);
      });
    });

    it("should work with monthly increment", () => {
      const start = parseDate("2024-01-15");
      const end = parseDate("2024-06-20");
      const result = stepInterval({ start, end }, { months: 1 });

      expect(result).toHaveLength(6); // Jan through June
      expect(result[0]).toBeInstanceOf(PlainDate);
      result.forEach((date) => {
        expect(date.day).toBe(15);
      });
    });

    it("should work with yearly increment", () => {
      const start = parseDate("2022-06-15");
      const end = parseDate("2025-08-20");
      const result = stepInterval({ start, end }, { years: 1 });

      expect(result).toHaveLength(4); // 2022, 2023, 2024, 2025
      expect(result[0]).toBeInstanceOf(PlainDate);
      result.forEach((date) => {
        expect(date.day).toBe(15);
        expect(date.month).toBe(6);
      });
    });
  });

  describe("interval functions", () => {
    describe("eachDayOfInterval", () => {
      it("should work with DateLike types and return PlainDate array", () => {
        const start = parseDate("2024-03-15");
        const end = parseDate("2024-03-17");
        const result = eachDayOfInterval({ start, end });

        expect(result).toHaveLength(3);
        expect(result[0]).toBeInstanceOf(PlainDate);
        expect(result[0] && PlainDate.compare(result[0], start)).toBe(0);
        expect(result[2] && PlainDate.compare(result[2], end)).toBe(0);
      });

      it("should handle mixed DateLike types", () => {
        const start = parseDateTime("2024-03-15T10:00:00");
        const end = parseInstant("2024-03-17T10:00:00Z");
        const result = eachDayOfInterval({ start, end });

        expect(result).toHaveLength(3);
        expect(result[0]).toBeInstanceOf(PlainDate);
      });
    });

    describe("eachWeekOfInterval", () => {
      it("should return PlainDate array of week starts", () => {
        const start = parseDate("2024-03-01"); // Friday
        const end = parseDate("2024-03-31");
        const result = eachWeekOfInterval({ start, end });

        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toBeInstanceOf(PlainDate);
        // First result should be start of week containing start date
        expect(result[0]?.dayOfWeek).toBe(7); // Sunday
      });
    });

    describe("eachMonthOfInterval", () => {
      it("should return PlainDate array of month starts", () => {
        const start = parseDate("2024-01-15");
        const end = parseDate("2024-03-20");
        const result = eachMonthOfInterval({ start, end });

        expect(result).toHaveLength(3); // Jan, Feb, Mar
        expect(result[0]).toBeInstanceOf(PlainDate);
        expect(result[0]?.day).toBe(1); // First of month
        expect(result[0]?.month).toBe(1); // January
        expect(result[2]?.month).toBe(3); // March
      });
    });

    describe("eachYearOfInterval", () => {
      it("should return PlainDate array of year starts", () => {
        const start = parseDate("2022-06-15");
        const end = parseDate("2024-08-20");
        const result = eachYearOfInterval({ start, end });

        expect(result).toHaveLength(3); // 2022, 2023, 2024
        expect(result[0]).toBeInstanceOf(PlainDate);
        expect(result[0]?.day).toBe(1); // First of year
        expect(result[0]?.month).toBe(1); // January
        expect(result[0]?.year).toBe(2022);
        expect(result[2]?.year).toBe(2024);
      });
    });
  });
});
