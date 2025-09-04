import { describe, it, expect } from "vitest";
import { PlainDate, PlainDateTime, Instant } from "./types";
import {
  compare,
  isBefore,
  isAfter,
  isEqualOrBefore,
  isEqualOrAfter,
  isSameDay,
  isSameWeek,
  rangesOverlap,
} from "./compare.js";

describe("compareDateLike()", () => {
  it("returns 0 for equal dates", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(compare(date1, date2)).toBe(0);
  });

  it("returns negative when first date is before second", () => {
    const earlier = PlainDate.from("2024-01-15");
    const later = PlainDate.from("2024-01-16");
    expect(compare(earlier, later)).toBeLessThan(0);
  });

  it("returns positive when first date is after second", () => {
    const later = PlainDate.from("2024-01-16");
    const earlier = PlainDate.from("2024-01-15");
    expect(compare(later, earlier)).toBeGreaterThan(0);
  });

  it("works with PlainDateTime objects", () => {
    const dt1 = PlainDateTime.from("2024-01-15T10:00:00");
    const dt2 = PlainDateTime.from("2024-01-15T10:30:00");
    expect(compare(dt1, dt2)).toBeLessThan(0);
  });

  it("works with Instant objects", () => {
    const instant1 = Instant.from("2024-01-15T10:00:00Z");
    const instant2 = Instant.from("2024-01-15T10:30:00Z");
    expect(compare(instant1, instant2)).toBeLessThan(0);
  });
});

describe("isBefore()", () => {
  it("returns true when first date is before second", () => {
    const earlier = PlainDate.from("2024-01-15");
    const later = PlainDate.from("2024-01-16");
    expect(isBefore(earlier, later)).toBe(true);
  });

  it("returns false when first date is after second", () => {
    const later = PlainDate.from("2024-01-16");
    const earlier = PlainDate.from("2024-01-15");
    expect(isBefore(later, earlier)).toBe(false);
  });

  it("returns false when dates are equal", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(isBefore(date1, date2)).toBe(false);
  });
});

describe("isAfter()", () => {
  it("returns true when first date is after second", () => {
    const later = PlainDate.from("2024-01-16");
    const earlier = PlainDate.from("2024-01-15");
    expect(isAfter(later, earlier)).toBe(true);
  });

  it("returns false when first date is before second", () => {
    const earlier = PlainDate.from("2024-01-15");
    const later = PlainDate.from("2024-01-16");
    expect(isAfter(earlier, later)).toBe(false);
  });

  it("returns false when dates are equal", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(isAfter(date1, date2)).toBe(false);
  });
});

describe("isEqualOrBefore()", () => {
  it("returns true when first date is before second", () => {
    const earlier = PlainDate.from("2024-01-15");
    const later = PlainDate.from("2024-01-16");
    expect(isEqualOrBefore(earlier, later)).toBe(true);
  });

  it("returns true when dates are equal", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(isEqualOrBefore(date1, date2)).toBe(true);
  });

  it("returns false when first date is after second", () => {
    const later = PlainDate.from("2024-01-16");
    const earlier = PlainDate.from("2024-01-15");
    expect(isEqualOrBefore(later, earlier)).toBe(false);
  });
});

describe("isEqualOrAfter()", () => {
  it("returns true when first date is after second", () => {
    const later = PlainDate.from("2024-01-16");
    const earlier = PlainDate.from("2024-01-15");
    expect(isEqualOrAfter(later, earlier)).toBe(true);
  });

  it("returns true when dates are equal", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(isEqualOrAfter(date1, date2)).toBe(true);
  });

  it("returns false when first date is before second", () => {
    const earlier = PlainDate.from("2024-01-15");
    const later = PlainDate.from("2024-01-16");
    expect(isEqualOrAfter(earlier, later)).toBe(false);
  });
});

describe("isSameDay()", () => {
  it("returns true for same calendar day", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-15");
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it("returns false for different calendar days", () => {
    const date1 = PlainDate.from("2024-01-15");
    const date2 = PlainDate.from("2024-01-16");
    expect(isSameDay(date1, date2)).toBe(false);
  });

  it("works with different DateLike types", () => {
    const plainDate = PlainDate.from("2024-01-15");
    const plainDateTime = PlainDateTime.from("2024-01-15T10:30:00");
    expect(isSameDay(plainDate, plainDateTime)).toBe(true);
  });

  it("treats Instant as UTC when comparing", () => {
    const instant1 = Instant.from("2024-01-15T23:30:00Z");
    const instant2 = Instant.from("2024-01-15T01:30:00Z");
    expect(isSameDay(instant1, instant2)).toBe(true);
  });

  it("returns false for instants on different UTC days", () => {
    const instant1 = Instant.from("2024-01-15T23:30:00Z");
    const instant2 = Instant.from("2024-01-16T01:30:00Z");
    expect(isSameDay(instant1, instant2)).toBe(false);
  });
});

describe("isSameWeek()", () => {
  it("returns true for dates in same week with default start (Sunday)", () => {
    // Sunday to Saturday of same week
    const sunday = PlainDate.from("2024-01-14"); // Sunday
    const saturday = PlainDate.from("2024-01-20"); // Saturday
    expect(isSameWeek(sunday, saturday)).toBe(true);
  });

  it("returns false for dates in different weeks with default start", () => {
    const saturday = PlainDate.from("2024-01-13"); // Saturday (previous week)
    const sunday = PlainDate.from("2024-01-14"); // Sunday (new week)
    expect(isSameWeek(saturday, sunday)).toBe(false);
  });

  it("works with custom week start (Sunday)", () => {
    const sunday = PlainDate.from("2024-01-14"); // Sunday
    const saturday = PlainDate.from("2024-01-20"); // Saturday
    expect(isSameWeek(sunday, saturday, 0)).toBe(true);
  });

  it("returns false for different weeks with custom week start", () => {
    const saturday = PlainDate.from("2024-01-13"); // Saturday (previous week when week starts Sunday)
    const sunday = PlainDate.from("2024-01-14"); // Sunday (next week when week starts Sunday)
    expect(isSameWeek(saturday, sunday, 0)).toBe(false);
  });

  it("works across year boundaries", () => {
    const dec31 = PlainDate.from("2023-12-31"); // Sunday
    const jan1 = PlainDate.from("2024-01-01"); // Monday
    // With Monday start, these should be in different weeks
    expect(isSameWeek(dec31, jan1, 1)).toBe(false);
    // With Sunday start, they should be in the same week
    expect(isSameWeek(dec31, jan1, 0)).toBe(true);
  });

  it("works with different DateLike types", () => {
    const plainDate = PlainDate.from("2024-01-15");
    const plainDateTime = PlainDateTime.from("2024-01-17T10:30:00");
    expect(isSameWeek(plainDate, plainDateTime)).toBe(true);
  });
});

describe("rangesOverlap()", () => {
  it("returns true for overlapping ranges", () => {
    const range1: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-20"),
    ];
    const range2: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-15"),
      PlainDate.from("2024-01-25"),
    ];
    expect(rangesOverlap(range1, range2)).toBe(true);
  });

  it("returns false for non-overlapping ranges", () => {
    const range1: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-15"),
    ];
    const range2: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-20"),
      PlainDate.from("2024-01-25"),
    ];
    expect(rangesOverlap(range1, range2)).toBe(false);
  });

  it("returns false for adjacent ranges (touching but not overlapping)", () => {
    const range1: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-15"),
    ];
    const range2: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-15"),
      PlainDate.from("2024-01-20"),
    ];
    expect(rangesOverlap(range1, range2, { inclusive: false })).toBe(false);
  });

  it("returns true when one range is completely inside another", () => {
    const outer: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-30"),
    ];
    const inner: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-15"),
      PlainDate.from("2024-01-20"),
    ];
    expect(rangesOverlap(outer, inner)).toBe(true);
    expect(rangesOverlap(inner, outer)).toBe(true);
  });

  it("returns true for identical ranges", () => {
    const range1: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-20"),
    ];
    const range2: readonly [PlainDate, PlainDate] = [
      PlainDate.from("2024-01-10"),
      PlainDate.from("2024-01-20"),
    ];
    expect(rangesOverlap(range1, range2)).toBe(true);
  });

  it("works with PlainDateTime ranges", () => {
    const range1: readonly [PlainDateTime, PlainDateTime] = [
      PlainDateTime.from("2024-01-15T10:00:00"),
      PlainDateTime.from("2024-01-15T12:00:00"),
    ];
    const range2: readonly [PlainDateTime, PlainDateTime] = [
      PlainDateTime.from("2024-01-15T11:00:00"),
      PlainDateTime.from("2024-01-15T13:00:00"),
    ];
    expect(rangesOverlap(range1, range2)).toBe(true);
  });
});
