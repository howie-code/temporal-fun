import { describe, it, expect } from "vitest";
import { PlainTime, PlainDate, PlainDateTime, Instant, Zoned } from "./types";
import {
  dateLike,
  timeLike,
  instant,
  date,
  zoned,
  dateTime,
} from "./convert.js";
import { parseZoned } from "./parse.js";

describe("dateLike()", () => {
  it("converts string dates to PlainDate", () => {
    const result = dateLike("2024-01-15");
    expect(result).toBeInstanceOf(PlainDate);
    expect(result.toString()).toBe("2024-01-15");
  });

  it("converts string datetimes to PlainDateTime", () => {
    const result = dateLike("2024-01-15 10:30");
    expect(result).toBeInstanceOf(PlainDateTime);
    expect(result.toString()).toBe("2024-01-15T10:30:00");
  });

  it("converts ISO instant strings", () => {
    const result = dateLike("2024-01-15T10:30:00Z");
    expect(result).toBeInstanceOf(Instant);
  });

  it("converts Date objects to Instant", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = dateLike(date);
    expect(result).toBeInstanceOf(Instant);
  });

  it("passes through DateLike objects unchanged", () => {
    const plainDate = PlainDate.from("2024-01-15");
    const result = dateLike(plainDate);
    expect(result).toBe(plainDate);
  });
});

describe("timeLike()", () => {
  it("converts PlainTime strings", () => {
    const result = timeLike("14:30:00");
    expect(result).toBeInstanceOf(PlainTime);
  });

  it("converts DateTime strings", () => {
    const result = timeLike("2024-01-15T14:30:00");
    expect(result).toBeInstanceOf(PlainDateTime);
  });

  it("converts Date objects to Instant", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = timeLike(date);
    expect(result).toBeInstanceOf(Instant);
  });
});

describe("date()", () => {
  it("converts various inputs to PlainDate", () => {
    expect(date("2024-01-15")).toBeInstanceOf(PlainDate);
    expect(date("2024-01-15T10:30:00")).toBeInstanceOf(PlainDate);
    expect(date(new Date("2024-01-15"))).toBeInstanceOf(PlainDate);
    expect(date("2024-01-15T10:30:00[America/New_York]")).toBeInstanceOf(
      PlainDate,
    );
    expect(date("2025-03-20T14:30:00-04:00[America/New_York]")).toBeInstanceOf(
      PlainDate,
    );
  });
});

describe("dateTime()", () => {
  it("converts various inputs to PlainDateTime", () => {
    const result1 = dateTime("2024-01-15");
    expect(result1).toBeInstanceOf(PlainDateTime);
    expect(result1.toPlainTime().toString()).toBe("00:00:00");

    const result2 = dateTime("2024-01-15T10:30:00");
    expect(result2).toBeInstanceOf(PlainDateTime);
    expect(result2.toPlainTime().toString()).toBe("10:30:00");
  });
});

describe("parseZoned()", () => {
  it("parses valid ZonedDateTime strings", () => {
    const result = parseZoned("2024-01-15T10:30:00[America/New_York]");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  it("handles fallback parsing for malformed timezone strings", () => {
    // This should fall back to the robust parsing
    const result = parseZoned("2024-01-15T10:30:00Z[America/New_York]");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
  });
});

describe("instant()", () => {
  it("creates Instant from Date", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = instant(date);
    expect(result).toBeInstanceOf(Instant);
    expect(result.epochMilliseconds).toBe(date.getTime());
  });

  it("parses instant strings", () => {
    const result = instant("2024-01-15T10:30:00Z");
    expect(result).toBeInstanceOf(Instant);
  });

  it("passes through existing Instant", () => {
    const original = Instant.from("2024-01-15T10:30:00Z");
    const result = instant(original);
    expect(result).toBe(original);
  });
});

describe("zoned()", () => {
  it("converts without timezone arg", () => {
    const zdt = zoned("2025-03-20T14:30:00-04:00[America/New_York]");
    expect(zdt).toBeInstanceOf(Zoned);
    expect(zdt.toString()).toBe("2025-03-20T14:30:00-04:00[America/New_York]");

    const inst = zoned("2025-03-20T14:30:00Z");
    expect(inst).toBeInstanceOf(Zoned);
    expect(inst.toString()).toBe("2025-03-20T14:30:00+00:00[UTC]");

    const zFromLegacy = zoned(new Date("2025-03-20T14:30:00Z"));
    expect(zFromLegacy).toBeInstanceOf(Zoned);
    expect(zFromLegacy.toString()).toBe("2025-03-20T14:30:00+00:00[UTC]");

    const zdtIdent = zoned(zdt);
    expect(zdtIdent).toBeInstanceOf(Zoned);
    expect(zdtIdent.toString()).toBe(
      "2025-03-20T14:30:00-04:00[America/New_York]",
    );
  });

  it("throws without timezone arg", () => {
    expect(() => zoned("2025-03-20")).toThrowError();
    expect(() => zoned("2025-03-20T14:30:00")).toThrowError();
  });

  it("converts PlainDate to ZonedDateTime", () => {
    const plainDate = PlainDate.from("2024-01-15");
    const result = zoned(plainDate, "America/New_York");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
    expect(result.toPlainDate().toString()).toBe("2024-01-15");
  });

  it("converts PlainDateTime to ZonedDateTime", () => {
    const plainDateTime = PlainDateTime.from("2024-01-15T10:30");
    const result = zoned(plainDateTime, "America/New_York");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  it("changes timezone of existing ZonedDateTime", () => {
    const existingZdt = Zoned.from("2024-01-15T10:30[UTC]");
    const result = zoned(existingZdt, "America/New_York");
    expect(result.timeZoneId).toBe("America/New_York");
  });

  it("converts string inputs via dateLike", () => {
    const result = zoned("2024-01-15", "America/New_York");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  it("converts Date objects to ZonedDateTime", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = zoned(date, "America/New_York");
    expect(result).toBeInstanceOf(Zoned);
    expect(result.timeZoneId).toBe("America/New_York");
  });

  it("fails typechecking and throws for plain-to-zoned without timezone", () => {
    // It's never valid to call zoned on PlainDate or PlainDateTime without a timezone arg
    const plainDate = PlainDate.from("2024-01-15");
    const plainDateTime = PlainDateTime.from("2024-01-15T10:30");

    // These lines should cause TypeScript compile errors:
    // @ts-expect-error - PlainDate requires timezone parameter
    expect(() => zoned(plainDate)).toThrowError();

    // @ts-expect-error - PlainDateTime requires timezone parameter
    expect(() => zoned(plainDateTime).toThrowError());
  });
});
