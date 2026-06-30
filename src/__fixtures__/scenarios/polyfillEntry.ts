// Matrix row: `import "temporal-fun/polyfill"` wires configure() without touching
// globalThis. Run via `bun run` (no preload); imports source, not the built subpath.
import "../../polyfill";
import { instant, isInstant } from "../../index";

const ok = isInstant(instant("2024-01-15T10:30:00Z"));
const globalUntouched = typeof (globalThis as { Temporal?: unknown }).Temporal === "undefined";
console.log(`USED:${ok}`);
console.log(`GLOBAL_UNTOUCHED:${globalUntouched}`);
