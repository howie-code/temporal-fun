// Matrix row: no Temporal at all -> first use must throw. Run via `bun run` (no preload).
import { instant, isInstant } from "../../index";

try {
  const result = instant("2024-01-15T10:30:00Z");
  console.log(`NO_THROW:${isInstant(result)}`);
} catch (err) {
  console.log(`THREW:${(err as Error).message}`);
}
