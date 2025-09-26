import { afterEach, beforeEach, describe, expect, it, jest } from "bun:test";
import { now, nowZoned, today } from "./convert.js";
import { fmtFull, fmtLong, fmtMedium, fmtRelativeToNow, fmtShort } from "./format.js";
import { Instant, PlainDate, PlainDateTime, PlainTime, Zoned } from "./types";

// Helper function to test format parts reliably across ICU variations
function expectFormatParts(formatted: string, expectedParts: string[]) {
  for (const part of expectedParts) {
    expect(formatted).toContain(part);
  }
}

describe("fmtRelativeToNow()", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2025-03-26T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
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
  describe("PlainDate short", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockDate, "en-US")).toBe("3/24/25");
      expect(fmtShort(mockDate, "en-GB")).toBe("24/03/2025");
      expect(fmtShort(mockDate, "es-ES")).toBe("24/3/25");
      expect(fmtShort(mockDate, "zh-CN")).toBe("2025/3/24");
    });
  });

  describe("PlainTime short", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockTime, "en-US")).toBe("8:30 AM");
      expect(fmtShort(mockTime, "en-GB")).toBe("08:30");
      expect(fmtShort(mockTime, "es-ES")).toBe("8:30");
      expect(fmtShort(mockTime, "zh-CN")).toBe("08:30");
    });
  });

  describe("PlainDateTime short", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtShort(mockDateTime, "en-US"), ["3/24/25", "8:30 AM"]);
      expectFormatParts(fmtShort(mockDateTime, "en-GB"), ["24/03/2025", "08:30"]);
      expectFormatParts(fmtShort(mockDateTime, "es-ES"), ["24/3/25", "8:30"]);
      expectFormatParts(fmtShort(mockDateTime, "zh-CN"), ["2025/3/24", "08:30"]);
    });
  });

  describe("Zoned short", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtShort(mockZoned, "en-US"), ["3/24/25", "8:30 AM", "EDT"]);
      expectFormatParts(fmtShort(mockZoned, "en-GB"), ["24/03/2025", "08:30", "GMT-4"]);
      expectFormatParts(fmtShort(mockZoned, "es-ES"), ["24/3/25", "8:30", "GMT-4"]);
      expectFormatParts(fmtShort(mockZoned, "zh-CN"), ["2025/3/24", "08:30", "GMT-4"]);
    });
  });

  describe("Instant short", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtShort(mockInstant, "en-US"), ["3/24/25", "6:30 AM", "UTC"]);
      expectFormatParts(fmtShort(mockInstant, "en-GB"), ["24/03/2025", "06:30", "UTC"]);
      expectFormatParts(fmtShort(mockInstant, "es-ES"), ["24/3/25", "6:30", "UTC"]);
      expectFormatParts(fmtShort(mockInstant, "zh-CN"), ["2025/3/24", "06:30", "UTC"]);
    });
  });
});

describe("fmtMedium()", () => {
  describe("PlainDate medium", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockDate, "en-US")).toBe("Mar 24, 2025");
      expect(fmtMedium(mockDate, "en-GB")).toBe("24 Mar 2025");
      expect(fmtMedium(mockDate, "es-ES")).toBe("24 mar 2025");
      expect(fmtMedium(mockDate, "zh-CN")).toBe("2025年3月24日");
    });
  });

  describe("PlainTime medium", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockTime, "en-US")).toBe("8:30:05 AM");
      expect(fmtMedium(mockTime, "en-GB")).toBe("08:30:05");
      expect(fmtMedium(mockTime, "es-ES")).toBe("8:30:05");
      expect(fmtMedium(mockTime, "zh-CN")).toBe("08:30:05");
    });
  });

  describe("PlainDateTime medium", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtMedium(mockDateTime, "en-US"), ["Mar 24, 2025", "8:30 AM"]);
      expectFormatParts(fmtMedium(mockDateTime, "en-GB"), ["24 Mar 2025", "08:30"]);
      expectFormatParts(fmtMedium(mockDateTime, "es-ES"), ["24 mar 2025", "8:30"]);
      expectFormatParts(fmtMedium(mockDateTime, "zh-CN"), ["2025年3月24日", "08:30"]);
    });
  });

  describe("Zoned medium", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtMedium(mockZoned, "en-US"), ["Mar 24, 2025", "8:30 AM", "EDT"]);
      expectFormatParts(fmtMedium(mockZoned, "en-GB"), ["24 Mar 2025", "08:30", "GMT-4"]);
      expectFormatParts(fmtMedium(mockZoned, "es-ES"), ["24 mar 2025", "8:30", "GMT-4"]);
      expectFormatParts(fmtMedium(mockZoned, "zh-CN"), ["2025年3月24日", "08:30", "GMT-4"]);
    });
  });

  describe("Instant medium", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtMedium(mockInstant, "en-US"), ["Mar 24, 2025", "6:30 AM", "UTC"]);
      expectFormatParts(fmtMedium(mockInstant, "en-GB"), ["24 Mar 2025", "06:30", "UTC"]);
      expectFormatParts(fmtMedium(mockInstant, "es-ES"), ["24 mar 2025", "6:30", "UTC"]);
      expectFormatParts(fmtMedium(mockInstant, "zh-CN"), ["2025年3月24日", "06:30", "UTC"]);
    });
  });
});

describe("fmtLong()", () => {
  describe("PlainDate long", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockDate, "en-US")).toBe("March 24, 2025");
      expect(fmtLong(mockDate, "en-GB")).toBe("24 March 2025");
      expect(fmtLong(mockDate, "es-ES")).toBe("24 de marzo de 2025");
      expect(fmtLong(mockDate, "zh-CN")).toBe("2025年3月24日");
    });
  });

  describe("PlainTime long", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockTime, "en-US")).toBe("8:30:05 AM");
      expect(fmtLong(mockTime, "en-GB")).toBe("08:30:05");
      expect(fmtLong(mockTime, "es-ES")).toBe("8:30:05");
      expect(fmtLong(mockTime, "zh-CN")).toBe("08:30:05");
    });
  });

  describe("PlainDateTime long", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtLong(mockDateTime, "en-US"), ["March 24, 2025", "8:30 AM"]);
      expectFormatParts(fmtLong(mockDateTime, "en-GB"), ["24 March 2025", "08:30"]);
      expectFormatParts(fmtLong(mockDateTime, "es-ES"), ["24 de marzo de 2025", "8:30"]);
      expectFormatParts(fmtLong(mockDateTime, "zh-CN"), ["2025年3月24日", "08:30"]);
    });
  });

  describe("Zoned long", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtLong(mockZoned, "en-US"), [
        "March 24, 2025",
        "8:30 AM",
        "Eastern Daylight Time",
      ]);
      expectFormatParts(fmtLong(mockZoned, "en-GB"), [
        "24 March 2025",
        "08:30",
        "Eastern Daylight Time",
      ]);
      expectFormatParts(fmtLong(mockZoned, "es-ES"), [
        "24 de marzo de 2025",
        "8:30",
        "hora de verano oriental",
      ]);
      expectFormatParts(fmtLong(mockZoned, "zh-CN"), [
        "2025年3月24日",
        "08:30",
        "北美东部夏令时间",
      ]);
    });
  });

  describe("Instant long", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtLong(mockInstant, "en-US"), ["March 24, 2025", "6:30 AM UTC"]);
      expectFormatParts(fmtLong(mockInstant, "en-GB"), ["24 March 2025", "06:30 UTC"]);
      expectFormatParts(fmtLong(mockInstant, "es-ES"), ["24 de marzo de 2025", "6:30 UTC"]);
      expectFormatParts(fmtLong(mockInstant, "zh-CN"), ["2025年3月24日", "06:30UTC"]);
    });
  });
});

describe("fmtFull()", () => {
  describe("PlainDate full", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtFull(mockDate, "en-US"), ["Monday", "March 24, 2025"]);
      expectFormatParts(fmtFull(mockDate, "en-GB"), ["Monday", "24 March 2025"]);
      expectFormatParts(fmtFull(mockDate, "es-ES"), ["lunes", "24 de marzo de 2025"]);
      expectFormatParts(fmtFull(mockDate, "zh-CN"), ["2025年3月24日", "星期一"]);
    });
  });

  describe("PlainTime full", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockTime, "en-US")).toBe("8:30:05 AM");
      expect(fmtFull(mockTime, "en-GB")).toBe("08:30:05");
      expect(fmtFull(mockTime, "es-ES")).toBe("8:30:05");
      expect(fmtFull(mockTime, "zh-CN")).toBe("08:30:05");
    });
  });

  describe("PlainDateTime full", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtFull(mockDateTime, "en-US"), ["Monday", "March 24, 2025", "8:30:05 AM"]);
      expectFormatParts(fmtFull(mockDateTime, "en-GB"), ["Monday", "24 March 2025", "08:30:05"]);
      expectFormatParts(fmtFull(mockDateTime, "es-ES"), [
        "lunes",
        "24 de marzo de 2025",
        "8:30:05",
      ]);
      expectFormatParts(fmtFull(mockDateTime, "zh-CN"), ["2025年3月24日", "星期一", "08:30:05"]);
    });
  });

  describe("Zoned full", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtFull(mockZoned, "en-US"), [
        "Monday",
        "March 24, 2025",
        "8:30:05 AM Eastern Daylight Time",
      ]);
      expectFormatParts(fmtFull(mockZoned, "en-GB"), [
        "Monday",
        "24 March 2025",
        "08:30:05 Eastern Daylight Time",
      ]);
      expectFormatParts(fmtFull(mockZoned, "es-ES"), [
        "lunes",
        "24 de marzo de 2025",
        "8:30:05 (hora de verano oriental)",
      ]);
      expectFormatParts(fmtFull(mockZoned, "zh-CN"), [
        "2025年3月24日",
        "星期一",
        "北美东部夏令时间 08:30:05",
      ]);
    });
  });

  describe("Instant full", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expectFormatParts(fmtFull(mockInstant, "en-US"), [
        "Monday",
        "March 24, 2025",
        "6:30:05 AM Coordinated Universal Time",
      ]);
      expectFormatParts(fmtFull(mockInstant, "en-GB"), [
        "Monday",
        "24 March 2025",
        "06:30:05 Coordinated Universal Time",
      ]);
      expectFormatParts(fmtFull(mockInstant, "es-ES"), [
        "lunes",
        "24 de marzo de 2025",
        "6:30:05 (tiempo universal coordinado)",
      ]);
      expectFormatParts(fmtFull(mockInstant, "zh-CN"), [
        "2025年3月24日",
        "星期一",
        "协调世界时 06:30:05",
      ]);
    });
  });
});
