import { describe, expect, test } from "bun:test";
import { join } from "node:path";

// Each row runs in a fresh `bun run` subprocess to get a clean environment without
// the test preload's global Temporal.
const scenariosDir = join(import.meta.dir, "__fixtures__", "scenarios");

function runScenario(script: string): string {
  const proc = Bun.spawnSync(["bun", "run", join(scenariosDir, script)]);
  const stdout = proc.stdout.toString().trim();
  const stderr = proc.stderr.toString().trim();
  if (proc.exitCode !== 0) {
    throw new Error(
      `scenario ${script} exited ${proc.exitCode}\nstdout: ${stdout}\nstderr: ${stderr}`,
    );
  }
  return stdout;
}

describe("environment matrix", () => {
  test("A: native global, no polyfill /global install, no configure()", () => {
    expect(runScenario("nativeGlobal.ts")).toContain("OK:true");
  });

  test("B: import 'temporal-fun/polyfill' wires configure() without touching globalThis", () => {
    const out = runScenario("polyfillEntry.ts");
    expect(out).toContain("USED:true");
    expect(out).toContain("GLOBAL_UNTOUCHED:true");
  });

  test("C: configure() works and never touches globalThis", () => {
    const out = runScenario("configureNoGlobal.ts");
    expect(out).toContain("USED:true");
    expect(out).toContain("GLOBAL_UNTOUCHED:true");
  });

  test("no Temporal at all throws a clear, actionable error", () => {
    const out = runScenario("missingTemporal.ts");
    expect(out).toContain("THREW:");
    expect(out).toContain("no Temporal implementation found");
    expect(out).toContain("temporal-fun/polyfill");
    expect(out).toContain("temporal-polyfill/global");
    expect(out).toContain("configure(Temporal)");
  });
});
