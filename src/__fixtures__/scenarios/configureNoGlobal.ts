// Matrix row C: configure() works and never touches globalThis. Run via `bun run`.
import { Temporal } from "temporal-polyfill";
import { configure, instant, isInstant, startOfDay } from "../../index";

configure(Temporal);

const i = instant("2024-01-15T10:30:00Z");
const sod = startOfDay(i);
const ok = isInstant(i) && isInstant(sod);
const globalUntouched = typeof (globalThis as { Temporal?: unknown }).Temporal === "undefined";

console.log(`USED:${ok}`);
console.log(`GLOBAL_UNTOUCHED:${globalUntouched}`);
