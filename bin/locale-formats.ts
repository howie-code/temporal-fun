#!/usr/bin/env bun

import {
  fmtShort,
  fmtMedium,
  fmtLong,
  fmtFull,
  PlainDate,
  PlainTime,
  PlainDateTime,
  Zoned,
  Instant,
} from "../src/index.ts";

const pd = PlainDate.from("2025-03-24");
const pt = PlainTime.from("08:30:05");
const dt = PlainDateTime.from("2025-03-24T08:30:05");
const zdt = Zoned.from("2025-03-24T08:30:05[America/New_York]");
const inst = Instant.from("2025-03-24T13:30:05Z");

const samples = [
  { name: "PlainDate", value: pd },
  { name: "PlainTime", value: pt },
  { name: "PlainDateTime", value: dt },
  { name: "Zoned", value: zdt },
  { name: "Instant", value: inst },
];

function generateTable(locales: string[]) {
  if (!locales || locales.length === 0) {
    console.error(
      "Usage: locale-fmts <locale1> [locale2] [locale3] ...",
    );
    console.error("Example: locale-fmts en-US en-GB es-ES");
    process.exit(1);
  }

  // Header row
  const header = `| Format | ${locales.join(" | ")} |`;
  const separator = `|${Array(locales.length + 1)
    .fill("")
    .map(() => "---")
    .join("|")}|`;

  console.log(header);
  console.log(separator);

  // Data rows
  for (const sample of samples) {
    for (const fmt of ["short", "medium", "long", "full"]) {
      const cells = [`${sample.name} ${fmt}`.padEnd(20, " ")];

      for (const locale of locales) {
        try {
          const fmtFn =
            fmt === "short"
              ? fmtShort
              : fmt === "medium"
                ? fmtMedium
                : fmt === "long"
                  ? fmtLong
                  : fmtFull;
          const formatted = fmtFn(sample.value, { locales: locale });
          cells.push(formatted);
        } catch (error) {
          cells.push("*Error*");
        }
      }

      console.log(`| ${cells.join(" | ")} |`);
    }
  }
}

// Get locales from command line arguments
const locales = process.argv.slice(2);
generateTable(locales);
