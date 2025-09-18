import { describe, it, expect } from "bun:test";
import { PlainDate, PlainDateTime, PlainTime, Instant, Zoned } from "./types";
import {
  isDate,
  isDateTime,
  isZoned,
  isTime,
  isInstant,
  isDateLike,
  isTimeLike,
} from "./guards.js";

// Test data
const plainDate = PlainDate.from("2024-01-15");
const plainDateTime = PlainDateTime.from("2024-01-15T10:30:00");
const plainTime = PlainTime.from("10:30:00");
const instant = Instant.from("2024-01-15T10:30:00Z");
const zoned = Zoned.from("2024-01-15T10:30:00[America/New_York]");

// Non-temporal values
const jsDate = new Date();
const string = "2024-01-15";
const number = 123;
const object = {};
const nullValue = null;
const undefinedValue = undefined;

describe("isDate()", () => {
  it("returns true for PlainDate", () => {
    expect(isDate(plainDate)).toBe(true);
  });

  it("returns false for other DateLike types", () => {
    expect(isDate(plainDateTime)).toBe(false);
    expect(isDate(instant)).toBe(false);
    expect(isDate(zoned)).toBe(false);
  });
});

describe("isDateTime()", () => {
  it("returns true for PlainDateTime", () => {
    expect(isDateTime(plainDateTime)).toBe(true);
  });

  it("returns false for other DateLike/TimeLike types", () => {
    expect(isDateTime(plainDate)).toBe(false);
    expect(isDateTime(plainTime)).toBe(false);
    expect(isDateTime(instant)).toBe(false);
    expect(isDateTime(zoned)).toBe(false);
  });
});

describe("isZoned()", () => {
  it("returns true for ZonedDateTime", () => {
    expect(isZoned(zoned)).toBe(true);
  });

  it("returns false for other DateLike/TimeLike types", () => {
    expect(isZoned(plainDate)).toBe(false);
    expect(isZoned(plainDateTime)).toBe(false);
    expect(isZoned(plainTime)).toBe(false);
    expect(isZoned(instant)).toBe(false);
  });
});

describe("isTime()", () => {
  it("returns true for PlainTime", () => {
    expect(isTime(plainTime)).toBe(true);
  });

  it("returns false for other TimeLike types", () => {
    expect(isTime(plainDateTime)).toBe(false);
    expect(isTime(instant)).toBe(false);
    expect(isTime(zoned)).toBe(false);
  });
});

describe("isInstant()", () => {
  it("returns true for Instant", () => {
    expect(isInstant(instant)).toBe(true);
  });

  it("returns false for other DateLike/TimeLike types", () => {
    expect(isInstant(plainDate)).toBe(false);
    expect(isInstant(plainDateTime)).toBe(false);
    expect(isInstant(plainTime)).toBe(false);
    expect(isInstant(zoned)).toBe(false);
  });
});

describe("isDateLike()", () => {
  it("returns true for all DateLike types", () => {
    expect(isDateLike(plainDate)).toBe(true);
    expect(isDateLike(plainDateTime)).toBe(true);
    expect(isDateLike(zoned)).toBe(true);
    expect(isDateLike(instant)).toBe(true);
  });

  it("returns false for TimeLike-only types", () => {
    expect(isDateLike(plainTime)).toBe(false);
  });

  it("returns false for non-Temporal values", () => {
    expect(isDateLike(jsDate)).toBe(false);
    expect(isDateLike(string)).toBe(false);
    expect(isDateLike(number)).toBe(false);
    expect(isDateLike(object)).toBe(false);
    expect(isDateLike(nullValue)).toBe(false);
    expect(isDateLike(undefinedValue)).toBe(false);
  });
});

describe("isTimeLike()", () => {
  it("returns true for all TimeLike types", () => {
    expect(isTimeLike(plainTime)).toBe(true);
    expect(isTimeLike(plainDateTime)).toBe(true);
    expect(isTimeLike(zoned)).toBe(true);
    expect(isTimeLike(instant)).toBe(true);
  });

  it("returns false for DateLike-only types", () => {
    expect(isTimeLike(plainDate)).toBe(false);
  });

  it("returns false for non-Temporal values", () => {
    expect(isTimeLike(jsDate)).toBe(false);
    expect(isTimeLike(string)).toBe(false);
    expect(isTimeLike(number)).toBe(false);
    expect(isTimeLike(object)).toBe(false);
    expect(isTimeLike(nullValue)).toBe(false);
    expect(isTimeLike(undefinedValue)).toBe(false);
  });
});

describe("Type narrowing behavior", () => {
  it("properly narrows types in conditional blocks", () => {
    const value: unknown = plainDate;
    
    if (isDateLike(value)) {
      // TypeScript should know this is DateLike
      expect(typeof value.toString).toBe("function");
    }
    
    if (isTimeLike(value)) {
      // This shouldn't execute for PlainDate
      expect(true).toBe(false);
    } else {
      // This should execute
      expect(true).toBe(true);
    }
  });

  it("distinguishes between overlapping types", () => {
    // PlainDateTime is both DateLike and TimeLike
    expect(isDateLike(plainDateTime)).toBe(true);
    expect(isTimeLike(plainDateTime)).toBe(true);
    expect(isDateTime(plainDateTime)).toBe(true);
    
    // PlainDate is only DateLike
    expect(isDateLike(plainDate)).toBe(true);
    expect(isTimeLike(plainDate)).toBe(false);
    expect(isDate(plainDate)).toBe(true);
    
    // PlainTime is only TimeLike
    expect(isDateLike(plainTime)).toBe(false);
    expect(isTimeLike(plainTime)).toBe(true);
    expect(isTime(plainTime)).toBe(true);
  });
});