import { afterEach, describe, expect, test } from "bun:test";
import {
  configure,
  date,
  getTemporal,
  instant,
  isDate,
  isInstant,
  type TemporalImpl,
} from "./index";

// The global is installed by the test preload (src/__setup__/installGlobalTemporal.ts).
const globalTemporal = (globalThis as unknown as { Temporal: TemporalImpl }).Temporal;

// Keep module state clean for sibling test files that rely on the global.
afterEach(() => {
  configure(globalTemporal);
});

describe("getTemporal", () => {
  test("resolves the installed global Temporal", () => {
    expect(getTemporal()).toBe(globalTemporal);
    expect(getTemporal().PlainDate).toBe(globalTemporal.PlainDate);
  });

  test("guards and conversions work against the resolved implementation", () => {
    expect(isDate(date("2024-01-15"))).toBe(true);
    expect(isInstant(instant("2024-01-15T10:30:00Z"))).toBe(true);
  });
});

describe("configure", () => {
  test("explicit injection takes precedence over the global", () => {
    const sentinel = { sentinel: true } as unknown as TemporalImpl;
    configure(sentinel);
    expect(getTemporal()).toBe(sentinel);
    expect(getTemporal()).not.toBe(globalTemporal);
  });

  test("re-reads on a later configure() call", () => {
    const sentinel = { sentinel: true } as unknown as TemporalImpl;
    configure(sentinel);
    expect(getTemporal()).toBe(sentinel);
    configure(globalTemporal);
    expect(getTemporal()).toBe(globalTemporal);
  });
});
