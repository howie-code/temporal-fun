import { describe, it, expect } from "bun:test";
import { jsonParseDateLike, jsonParseTimeLike } from "./json";
import { Temporal } from "temporal-polyfill";

describe("JSON parse functions", () => {
  it("jsonParseDateLike", () => {
    // Parse bare string - various formats
    expect(jsonParseDateLike('"2024-01-15"')).toBeInstanceOf(
      Temporal.PlainDate,
    );
    expect(jsonParseDateLike('"2024-01-15T10:30:00"')).toBeInstanceOf(
      Temporal.PlainDateTime,
    );
    expect(jsonParseDateLike('"2024-01-15T10:30:00Z"')).toBeInstanceOf(
      Temporal.Instant,
    );

    // Parse object with mixed date types
    const obj = jsonParseDateLike(`{
      "date": "2024-01-15",
      "datetime": "2024-01-15T10:30:00",
      "instant": "2024-01-15T10:30:00Z",
      "zoned": "2024-01-15T10:30:00[America/New_York]",
      "offset": "2024-01-15T10:30:00+05:00"
    }`);
    expect(obj.date).toBeInstanceOf(Temporal.PlainDate);
    expect(obj.datetime).toBeInstanceOf(Temporal.PlainDateTime);
    expect(obj.instant).toBeInstanceOf(Temporal.Instant);
    expect(obj.zoned).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(obj.offset).toBeInstanceOf(Temporal.ZonedDateTime);

    // Parse array
    const arr = jsonParseDateLike(
      '["2024-01-15", "2024-01-15T10:30:00Z", "not-a-date"]',
    );
    expect(arr[0]).toBeInstanceOf(Temporal.PlainDate);
    expect(arr[1]).toBeInstanceOf(Temporal.Instant);
    expect(arr[2]).toBe("not-a-date");
  });

  it("jsonParseTimeLike", () => {
    // Parse bare string - various formats
    expect(jsonParseTimeLike('"14:30"')).toBeInstanceOf(Temporal.PlainTime);
    expect(jsonParseTimeLike('"2024-01-15T10:30:00"')).toBeInstanceOf(
      Temporal.PlainDateTime,
    );

    // Parse object with mixed time types
    const obj = jsonParseTimeLike(
      '{"time": "14:30:00", "twelve": "2:30pm", "datetime": "2024-01-15T10:30:00", "instant": "2024-01-15T10:30:00Z"}',
    );
    expect(obj.time).toBeInstanceOf(Temporal.PlainTime);
    expect(obj.twelve).toBeInstanceOf(Temporal.PlainTime);
    expect(obj.datetime).toBeInstanceOf(Temporal.PlainDateTime);
    expect(obj.instant).toBeInstanceOf(Temporal.Instant);

    // Parse array with keys
    const arr = jsonParseTimeLike(
      '{"times": ["09:00", "12:30pm", "2024-01-15T10:30:00"], "other": "text"}',
      ["times", ""],
    );
    expect(arr.times[0]).toBeInstanceOf(Temporal.PlainTime);
    expect(arr.times[1]).toBeInstanceOf(Temporal.PlainTime);
    expect(arr.times[2]).toBeInstanceOf(Temporal.PlainDateTime);
    expect(arr.other).toBe("text");
  });
});
