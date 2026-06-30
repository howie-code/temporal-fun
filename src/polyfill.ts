// `import "temporal-fun/polyfill"` — inject temporal-polyfill's Temporal via
// configure() (no globalThis mutation).
import { Temporal } from "temporal-polyfill";
import { configure } from "./temporal";

configure(Temporal);
