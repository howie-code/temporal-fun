import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlainDate, PlainDateTime, PlainTime, Instant, Zoned } from "./types";
import {
  DateFmt,
  TimeFmt,
  DateTimeFmt,
  ZonedFmt,
  InstantFmt,
  fmtRelativeToNow,
  fmtShort,
  fmtMedium,
  fmtLong,
} from "./format.js";
import { now, nowZoned, today } from "./convert.js";

// Mock dates to ensure consistent test results
const mockDate = PlainDate.from("2025-03-24");
const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");
const mockTime = PlainTime.from("08:30:05");
const mockInstant = Instant.from("2025-03-24T20:30:05Z");
const mockZoned = Zoned.from("2025-03-24T08:30:05[America/Los_Angeles]");

describe("DateFmt", () => {
  it("Short formats as expected", () => {
    const result = mockDate.toLocaleString("en-US", DateFmt.Short);
    expect(result).toBe("3/24/25");
  });

  it("Medium formats as expected", () => {
    const result = mockDate.toLocaleString("en-US", DateFmt.Medium);
    expect(result).toBe("Mar 24, 2025");
  });

  it("Long formats as expected", () => {
    const result = mockDate.toLocaleString("en-US", DateFmt.Long);
    expect(result).toBe("March 24, 2025");
  });
});

describe("TimeFmt", () => {
  it("Short12h formats as expected", () => {
    const result = mockTime.toLocaleString("en-US", TimeFmt.Short12h);
    expect(result).toBe("8:30 AM");
  });

  it("Long12h formats as expected", () => {
    const result = mockTime.toLocaleString("en-US", TimeFmt.Long12h);
    expect(result).toBe("8:30:05 AM");
  });

  it("Short24h formats as expected", () => {
    const result = mockTime.toLocaleString("en-US", TimeFmt.Short24h);
    expect(result).toBe("08:30");
  });

  it("Long24h formats as expected", () => {
    const result = mockTime.toLocaleString("en-US", TimeFmt.Long24h);
    expect(result).toBe("08:30:05");
  });
});

describe("DateTimeFmt", () => {
  it("Short12h formats as expected", () => {
    const result = mockDateTime.toLocaleString("en-US", DateTimeFmt.Short12h);
    expect(result).toBe("3/24/25, 8:30 AM");
  });

  it("Medium12h formats as expected", () => {
    const result = mockDateTime.toLocaleString("en-US", DateTimeFmt.Medium12h);
    expect(result).toBe("Mar 24, 2025, 8:30 AM");
  });

  it("Long12h formats as expected", () => {
    const result = mockDateTime.toLocaleString("en-US", DateTimeFmt.Long12h);
    expect(result).toBe("March 24, 2025 at 8:30:05 AM");
  });

  it("Short24h formats as expected", () => {
    const result = mockDateTime.toLocaleString("en-US", DateTimeFmt.Short24h);
    expect(result).toBe("3/24/25, 08:30");
  });

  it("Long24h formats as expected", () => {
    const result = mockDateTime.toLocaleString("en-US", DateTimeFmt.Long24h);
    expect(result).toBe("March 24, 2025 at 08:30:05");
  });
});

describe("ZonedFmt", () => {
  it("Short12h formats with timezone abbreviation", () => {
    const result = mockZoned.toLocaleString("en-US", ZonedFmt.Short12h);
    expect(result).toMatch("3/24/25, 8:30 AM PDT");
  });

  it("Long12h formats with full timezone name", () => {
    const result = mockZoned.toLocaleString("en-US", ZonedFmt.Long12h);
    expect(result).toMatch(
      "March 24, 2025 at 8:30:05 AM Pacific Daylight Time",
    );
  });

  it("Short24h formats with timezone abbreviation", () => {
    const result = mockZoned.toLocaleString("en-US", ZonedFmt.Short24h);
    expect(result).toMatch("3/24/25, 08:30 PDT");
  });

  it("Long24h formats with full timezone name", () => {
    const result = mockZoned.toLocaleString("en-US", ZonedFmt.Long24h);
    expect(result).toMatch("March 24, 2025 at 08:30:05 Pacific Daylight Time");
  });
});

describe("InstantFmt", () => {
  it("Short formats as expected", () => {
    const result = mockInstant.toLocaleString("en-US", InstantFmt.Short);
    expect(result).toBe("3/24/25, 20:30");
  });

  it("Medium formats as expected", () => {
    const result = mockInstant.toLocaleString("en-US", InstantFmt.Medium);
    expect(result).toBe("Mar 24, 2025, 20:30");
  });

  it("Long formats with UTC offset", () => {
    const result = mockInstant.toLocaleString("en-US", InstantFmt.Long);
    expect(result).toBe("March 24, 2025 at 20:30:05 UTC");
  });
});

describe("fmtRelativeToNow()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-03-26T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats past dates correctly", () => {
    const twoDaysAgo = today().subtract({ days: 2 });
    const result = fmtRelativeToNow(twoDaysAgo);
    expect(result).toBe("2 days ago");
  });

  it("formats future dates correctly", () => {
    const currentZoned = nowZoned();
    const inThreeHours = currentZoned.add({ hours: 3 });
    const result = fmtRelativeToNow(inThreeHours);
    expect(result).toBe("in 3 hours");
  });

  it("formats current time as now", () => {
    const currentInstant = now();
    const result = fmtRelativeToNow(currentInstant);
    expect(result).toBe("now");
  });

  it("works with different DateLike types", () => {
    const currentDate = today();
    const twoDaysAgo = currentDate.subtract({ days: 2 });
    const result = fmtRelativeToNow(twoDaysAgo);
    expect(result).toBe("2 days ago");
  });

  it("works with Zoned dates", () => {
    const currentZoned = nowZoned("America/New_York");
    const twoDaysAgo = currentZoned.subtract({ days: 2 });
    const result = fmtRelativeToNow(twoDaysAgo);
    expect(result).toBe("2 days ago");
  });

  it("respects locale option", () => {
    const currentZoned = nowZoned();
    const yesterday = currentZoned.subtract({ days: 1 });
    const result = fmtRelativeToNow(yesterday, { locales: "es" });
    expect(result).toBe("ayer");
  });

  it("respects style option", () => {
    const currentZoned = nowZoned();
    const yesterday = currentZoned.subtract({ days: 1 });
    const result = fmtRelativeToNow(yesterday, { style: "narrow" });
    expect(result).toBe("yesterday");
  });

  it("handles minutes correctly", () => {
    const currentZoned = nowZoned();
    const fifteenMinutesAgo = currentZoned.subtract({ minutes: 15 });
    const result = fmtRelativeToNow(fifteenMinutesAgo);
    expect(result).toBe("15 minutes ago");
  });

  it("handles hours correctly", () => {
    const currentZoned = nowZoned();
    const twoHoursAgo = currentZoned.subtract({ hours: 2 });
    const result = fmtRelativeToNow(twoHoursAgo);
    expect(result).toBe("2 hours ago");
  });
});

describe("fmtShort()", () => {
  it("formats PlainDate with DateFmt.Short", () => {
    const result = fmtShort(mockDate, { locales: "en-US" });
    expect(result).toBe("3/24/25");
  });

  it("formats PlainDateTime with DateTimeFmt.Short24h", () => {
    const result = fmtShort(mockDateTime, { locales: "en-US" });
    expect(result).toBe("3/24/25, 08:30");
  });

  it("formats PlainTime with TimeFmt.Short24h", () => {
    const result = fmtShort(mockTime, { locales: "en-US" });
    expect(result).toBe("08:30");
  });

  it("formats Instant with InstantFmt.Short", () => {
    const result = fmtShort(mockInstant, { locales: "en-US" });
    expect(result).toBe("3/24/25, 20:30");
  });

  it("formats Zoned with ZonedFmt.Short24h", () => {
    const result = fmtShort(mockZoned, { locales: "en-US" });
    expect(result).toMatch(/3\/24\/25, 08:30 P[SD]T/);
  });

  it("respects hour12 parameter for time formatting", () => {
    const result = fmtShort(mockTime, { locales: "en-US", hour12: true });
    expect(result).toBe("8:30 AM");
  });

  it("works with different locales", () => {
    const result = fmtShort(mockDate, { locales: "de-DE" });
    expect(result).toBe("24.3.25");
  });

  it("works with locale array", () => {
    const result = fmtShort(mockDate, { locales: ["en-CA", "en-US"] });
    expect(result).toMatch(/25-03-24|3\/24\/25/);
  });
});

describe("fmtMedium()", () => {
  it("formats PlainDate with DateFmt.Medium", () => {
    const result = fmtMedium(mockDate, { locales: "en-US" });
    expect(result).toBe("Mar 24, 2025");
  });

  it("formats PlainDateTime with DateTimeFmt.Medium24h", () => {
    const result = fmtMedium(mockDateTime, { locales: "en-US" });
    expect(result).toBe("Mar 24, 2025, 08:30");
  });

  it("formats Zoned with ZonedFmt.Medium24h", () => {
    const result = fmtMedium(mockZoned, { locales: "en-US" });
    expect(result).toMatch(/Mar 24, 2025, 08:30 P[SD]T/);
  });
});

describe("fmtLong()", () => {
  it("formats PlainDate with DateFmt.Long", () => {
    const result = fmtLong(mockDate, { locales: "en-US" });
    expect(result).toBe("March 24, 2025");
  });

  it("formats PlainDateTime with DateTimeFmt.Long24h", () => {
    const result = fmtLong(mockDateTime, { locales: "en-US" });
    expect(result).toBe("March 24, 2025 at 08:30:05");
  });

  it("formats PlainTime with TimeFmt.Long24h", () => {
    const result = fmtLong(mockTime, { locales: "en-US" });
    expect(result).toBe("08:30:05");
  });

  it("formats Instant with InstantFmt.Long", () => {
    const result = fmtLong(mockInstant, { locales: "en-US" });
    expect(result).toBe("March 24, 2025 at 20:30:05 UTC");
  });

  it("formats Zoned with ZonedFmt.Long24h", () => {
    const result = fmtLong(mockZoned, { locales: "en-US" });
    expect(result).toMatch(/March 24, 2025 at 08:30:05 Pacific .* Time/);
  });

  it("respects hour12 parameter for time formatting", () => {
    const result = fmtLong(mockTime, { locales: "en-US", hour12: true });
    expect(result).toBe("8:30:05 AM");
  });

  it("works with different locales", () => {
    const result = fmtLong(mockDate, { locales: "de-DE" });
    expect(result).toBe("24. März 2025");
  });

  it("works with locale array", () => {
    const result = fmtLong(mockDate, { locales: ["en-CA", "en-US"] });
    expect(result).toMatch(/March 24, 2025|24 mars 2025/);
  });
});
