// Matrix row A: native Temporal (simulated by assigning globalThis.Temporal), no
// `/global` install, no configure(). Run via `bun run`.
import { Temporal } from "temporal-polyfill";

(globalThis as { Temporal?: unknown }).Temporal = Temporal;

const { instant, isInstant, date, isDate } = await import("../../index");

const i = instant("2024-01-15T10:30:00Z");
const d = date("2024-01-15");
console.log(`OK:${isInstant(i) && isDate(d)}`);
