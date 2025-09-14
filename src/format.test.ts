import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { PlainDate, PlainDateTime, PlainTime, Instant, Zoned } from "./types";
import {
  fmtRelativeToNow,
  fmtShort,
  fmtMedium,
  fmtLong,
  fmtFull,
} from "./format.js";
import { now, nowZoned, today } from "./convert.js";

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
  describe("PlainDate short", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockDate, { locales: "en-US" })).toBe("3/24/25");
      expect(fmtShort(mockDate, { locales: "en-GB" })).toBe("24/03/2025");
      expect(fmtShort(mockDate, { locales: "es-ES" })).toBe("24/3/25");
      expect(fmtShort(mockDate, { locales: "zh-CN" })).toBe("2025/3/24");
    });
  });

  describe("PlainTime short", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockTime, { locales: "en-US" })).toBe("8:30 AM");
      expect(fmtShort(mockTime, { locales: "en-GB" })).toBe("08:30");
      expect(fmtShort(mockTime, { locales: "es-ES" })).toBe("8:30");
      expect(fmtShort(mockTime, { locales: "zh-CN" })).toBe("08:30");
    });
  });

  describe("PlainDateTime short", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockDateTime, { locales: "en-US" })).toBe(
        "3/24/25, 8:30 AM",
      );
      expect(fmtShort(mockDateTime, { locales: "en-GB" })).toBe(
        "24/03/2025, 08:30",
      );
      expect(fmtShort(mockDateTime, { locales: "es-ES" })).toBe(
        "24/3/25, 8:30",
      );
      expect(fmtShort(mockDateTime, { locales: "zh-CN" })).toBe(
        "2025/3/24 08:30",
      );
    });
  });

  describe("Zoned short", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockZoned, { locales: "en-US" })).toBe(
        "3/24/25, 8:30 AM EDT",
      );
      expect(fmtShort(mockZoned, { locales: "en-GB" })).toBe(
        "24/03/2025, 08:30 GMT-4",
      );
      expect(fmtShort(mockZoned, { locales: "es-ES" })).toBe(
        "24/3/25, 8:30 GMT-4",
      );
      expect(fmtShort(mockZoned, { locales: "zh-CN" })).toBe(
        "2025/3/24 08:30GMT-4",
      );
    });
  });

  describe("Instant short", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expect(fmtShort(mockInstant, { locales: "en-US" })).toBe(
        "3/24/25, 6:30 AM UTC",
      );
      expect(fmtShort(mockInstant, { locales: "en-GB" })).toBe(
        "24/03/2025, 06:30 UTC",
      );
      expect(fmtShort(mockInstant, { locales: "es-ES" })).toBe(
        "24/3/25, 6:30 UTC",
      );
      expect(fmtShort(mockInstant, { locales: "zh-CN" })).toBe(
        "2025/3/24 06:30UTC",
      );
    });
  });
});

describe("fmtMedium()", () => {
  describe("PlainDate medium", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockDate, { locales: "en-US" })).toBe("Mar 24, 2025");
      expect(fmtMedium(mockDate, { locales: "en-GB" })).toBe("24 Mar 2025");
      expect(fmtMedium(mockDate, { locales: "es-ES" })).toBe("24 mar 2025");
      expect(fmtMedium(mockDate, { locales: "zh-CN" })).toBe("2025年3月24日");
    });
  });

  describe("PlainTime medium", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockTime, { locales: "en-US" })).toBe("8:30:05 AM");
      expect(fmtMedium(mockTime, { locales: "en-GB" })).toBe("08:30:05");
      expect(fmtMedium(mockTime, { locales: "es-ES" })).toBe("8:30:05");
      expect(fmtMedium(mockTime, { locales: "zh-CN" })).toBe("08:30:05");
    });
  });

  describe("PlainDateTime medium", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockDateTime, { locales: "en-US" })).toBe(
        "Mar 24, 2025, 8:30 AM",
      );
      expect(fmtMedium(mockDateTime, { locales: "en-GB" })).toBe(
        "24 Mar 2025, 08:30",
      );
      expect(fmtMedium(mockDateTime, { locales: "es-ES" })).toBe(
        "24 mar 2025, 8:30",
      );
      expect(fmtMedium(mockDateTime, { locales: "zh-CN" })).toBe(
        "2025年3月24日 08:30",
      );
    });
  });

  describe("Zoned medium", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockZoned, { locales: "en-US" })).toBe(
        "Mar 24, 2025, 8:30 AM EDT",
      );
      expect(fmtMedium(mockZoned, { locales: "en-GB" })).toBe(
        "24 Mar 2025, 08:30 GMT-4",
      );
      expect(fmtMedium(mockZoned, { locales: "es-ES" })).toBe(
        "24 mar 2025, 8:30 GMT-4",
      );
      expect(fmtMedium(mockZoned, { locales: "zh-CN" })).toBe(
        "2025年3月24日 08:30GMT-4",
      );
    });
  });

  describe("Instant medium", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expect(fmtMedium(mockInstant, { locales: "en-US" })).toBe(
        "Mar 24, 2025, 6:30 AM UTC",
      );
      expect(fmtMedium(mockInstant, { locales: "en-GB" })).toBe(
        "24 Mar 2025, 06:30 UTC",
      );
      expect(fmtMedium(mockInstant, { locales: "es-ES" })).toBe(
        "24 mar 2025, 6:30 UTC",
      );
      expect(fmtMedium(mockInstant, { locales: "zh-CN" })).toBe(
        "2025年3月24日 06:30UTC",
      );
    });
  });
});

describe("fmtLong()", () => {
  describe("PlainDate long", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockDate, { locales: "en-US" })).toBe("March 24, 2025");
      expect(fmtLong(mockDate, { locales: "en-GB" })).toBe("24 March 2025");
      expect(fmtLong(mockDate, { locales: "es-ES" })).toBe(
        "24 de marzo de 2025",
      );
      expect(fmtLong(mockDate, { locales: "zh-CN" })).toBe("2025年3月24日");
    });
  });

  describe("PlainTime long", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockTime, { locales: "en-US" })).toBe("8:30:05 AM");
      expect(fmtLong(mockTime, { locales: "en-GB" })).toBe("08:30:05");
      expect(fmtLong(mockTime, { locales: "es-ES" })).toBe("8:30:05");
      expect(fmtLong(mockTime, { locales: "zh-CN" })).toBe("08:30:05");
    });
  });

  describe("PlainDateTime long", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockDateTime, { locales: "en-US" })).toBe(
        "March 24, 2025 at 8:30 AM",
      );
      expect(fmtLong(mockDateTime, { locales: "en-GB" })).toBe(
        "24 March 2025 at 08:30",
      );
      expect(fmtLong(mockDateTime, { locales: "es-ES" })).toBe(
        "24 de marzo de 2025, 8:30",
      );
      expect(fmtLong(mockDateTime, { locales: "zh-CN" })).toBe(
        "2025年3月24日 08:30",
      );
    });
  });

  describe("Zoned long", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockZoned, { locales: "en-US" })).toBe(
        "March 24, 2025 at 8:30 AM Eastern Daylight Time",
      );
      expect(fmtLong(mockZoned, { locales: "en-GB" })).toBe(
        "24 March 2025 at 08:30 Eastern Daylight Time",
      );
      expect(fmtLong(mockZoned, { locales: "es-ES" })).toBe(
        "24 de marzo de 2025, 8:30 hora de verano oriental",
      );
      expect(fmtLong(mockZoned, { locales: "zh-CN" })).toBe(
        "2025年3月24日 08:30北美东部夏令时间",
      );
    });
  });

  describe("Instant long", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expect(fmtLong(mockInstant, { locales: "en-US" })).toBe(
        "March 24, 2025 at 6:30 AM UTC",
      );
      expect(fmtLong(mockInstant, { locales: "en-GB" })).toBe(
        "24 March 2025 at 06:30 UTC",
      );
      expect(fmtLong(mockInstant, { locales: "es-ES" })).toBe(
        "24 de marzo de 2025, 6:30 UTC",
      );
      expect(fmtLong(mockInstant, { locales: "zh-CN" })).toBe(
        "2025年3月24日 06:30UTC",
      );
    });
  });
});

describe("fmtFull()", () => {
  describe("PlainDate full", () => {
    const mockDate = PlainDate.from("2025-03-24");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockDate, { locales: "en-US" })).toBe(
        "Monday, March 24, 2025",
      );
      expect(fmtFull(mockDate, { locales: "en-GB" })).toBe(
        "Monday, 24 March 2025",
      );
      expect(fmtFull(mockDate, { locales: "es-ES" })).toBe(
        "lunes, 24 de marzo de 2025",
      );
      expect(fmtFull(mockDate, { locales: "zh-CN" })).toBe(
        "2025年3月24日星期一",
      );
    });
  });

  describe("PlainTime full", () => {
    const mockTime = PlainTime.from("08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockTime, { locales: "en-US" })).toBe("8:30:05 AM");
      expect(fmtFull(mockTime, { locales: "en-GB" })).toBe("08:30:05");
      expect(fmtFull(mockTime, { locales: "es-ES" })).toBe("8:30:05");
      expect(fmtFull(mockTime, { locales: "zh-CN" })).toBe("08:30:05");
    });
  });

  describe("PlainDateTime full", () => {
    const mockDateTime = PlainDateTime.from("2025-03-24T08:30:05");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockDateTime, { locales: "en-US" })).toBe(
        "Monday, March 24, 2025 at 8:30:05 AM",
      );
      expect(fmtFull(mockDateTime, { locales: "en-GB" })).toBe(
        "Monday, 24 March 2025 at 08:30:05",
      );
      expect(fmtFull(mockDateTime, { locales: "es-ES" })).toBe(
        "lunes, 24 de marzo de 2025, 8:30:05",
      );
      expect(fmtFull(mockDateTime, { locales: "zh-CN" })).toBe(
        "2025年3月24日星期一 08:30:05",
      );
    });
  });

  describe("Zoned full", () => {
    const mockZoned = Zoned.from("2025-03-24T08:30:05[America/New_York]");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockZoned, { locales: "en-US" })).toBe(
        "Monday, March 24, 2025 at 8:30:05 AM Eastern Daylight Time",
      );
      expect(fmtFull(mockZoned, { locales: "en-GB" })).toBe(
        "Monday, 24 March 2025 at 08:30:05 Eastern Daylight Time",
      );
      expect(fmtFull(mockZoned, { locales: "es-ES" })).toBe(
        "lunes, 24 de marzo de 2025, 8:30:05 (hora de verano oriental)",
      );
      expect(fmtFull(mockZoned, { locales: "zh-CN" })).toBe(
        "2025年3月24日星期一 北美东部夏令时间 08:30:05",
      );
    });
  });

  describe("Instant full", () => {
    const mockInstant = Instant.from("2025-03-24T06:30:05Z");

    it("formats across multiple locales", () => {
      expect(fmtFull(mockInstant, { locales: "en-US" })).toBe(
        "Monday, March 24, 2025 at 6:30:05 AM Coordinated Universal Time",
      );
      expect(fmtFull(mockInstant, { locales: "en-GB" })).toBe(
        "Monday, 24 March 2025 at 06:30:05 Coordinated Universal Time",
      );
      expect(fmtFull(mockInstant, { locales: "es-ES" })).toBe(
        "lunes, 24 de marzo de 2025, 6:30:05 (tiempo universal coordinado)",
      );
      expect(fmtFull(mockInstant, { locales: "zh-CN" })).toBe(
        "2025年3月24日星期一 协调世界时 06:30:05",
      );
    });
  });
});
