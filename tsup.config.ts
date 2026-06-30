import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts", "src/polyfill.ts"],
  format: ["esm"],
  sourcemap: true,
  target: "es2022",
  // Share one temporal.ts instance across entries, else `temporal-fun/polyfill`'s
  // configure() writes state the main entry never reads (silent break).
  splitting: true,
  treeshake: true,
});
