import { describe, it, expect, beforeEach } from "bun:test";
import * as config from "./config.js";
import { isSameWeek } from "./compare.js";
import { PlainDate } from "./types.js";

describe("temporalConfig", () => {
  beforeEach(() => {
    // Reset to default
    config.setLocales("en-US");
  });

  it("should allow setting and getting weekStart", () => {
    expect(config.getLocales()).toBe("en-US");
    expect(config.getWeekStart()).toBe(7);
    config.setLocales("en-GB");
    expect(config.getLocales()).toBe("en-GB");
    expect(config.getWeekStart()).toBe(1);
  });

  it("should use global weekStart default in functions", () => {
    const saturday = PlainDate.from("2024-01-13"); // Saturday
    const sunday = PlainDate.from("2024-01-14"); // Sunday

    // Defaulted to en-US Sunday start
    expect(isSameWeek(saturday, sunday)).toBe(false);

    // Change to en-GB Monday start
    config.setLocales("en-GB");
    expect(isSameWeek(saturday, sunday)).toBe(true);
  });
});
