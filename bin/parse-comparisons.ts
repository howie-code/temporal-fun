#!/usr/bin/env bun

import {
  type DateLike,
  date,
  dateTime,
  Instant,
  instant,
  PlainDate,
  PlainDateTime,
  PlainTime,
  type TimeLike,
  time,
  Zoned,
  zoned,
} from "../src/index";

// Create instances of each temporal type to generate test formats
const inst = Instant.from("2025-03-20T14:30:00Z");
const pd = PlainDate.from("2025-03-20");
const pdt = PlainDateTime.from("2025-03-20T14:30:00");
const zdt = Zoned.from("2025-03-20T14:30:00[America/New_York]");
const pt = PlainTime.from("14:30:00");

// Generate serialized strings for testing
const testFormats = [
  { name: "Instant", format: inst.toString() },
  { name: "Offset", format: "2025-03-20T14:30:00-08:00" },
  { name: "PlainDate", format: pd.toString() },
  { name: "PlainDateTime", format: pdt.toString() },
  { name: "Zoned", format: zdt.toString() },
  { name: "Mismatch", format: "2025-06-16T17:00:00-04:00[America/Asuncion]" },
  { name: "PlainTime", format: pt.toString() },
  { name: "12 Hour", format: "07:30 pm" },
];

function tryParse(fn: (input: string) => DateLike | TimeLike, input: string): string {
  try {
    const result = fn(input);
    return result.toString();
  } catch {
    return "Error";
  }
}

function generateParsingTable() {
  for (const test of testFormats) {
    console.log(`\n## Format: "${test.format}"`);
    console.log("| Type | Temporal | temporal-fun |");
    console.log("|------|---------------|-----------------|");

    // Instant parsing
    const instantTemporal = tryParse(Instant.from, test.format);
    const instantConvert = tryParse(instant, test.format);
    console.log(`| Instant | ${instantTemporal} | ${instantConvert} |`);

    // PlainDate parsing
    const dateTemporal = tryParse(PlainDate.from, test.format);
    const dateConvert = tryParse(date, test.format);
    console.log(`| PlainDate | ${dateTemporal} | ${dateConvert} |`);

    // PlainDateTime parsing
    const dateTimeTemporal = tryParse(PlainDateTime.from, test.format);
    const dateTimeConvert = tryParse(dateTime, test.format);
    console.log(`| PlainDateTime | ${dateTimeTemporal} | ${dateTimeConvert} |`);

    // ZonedDateTime parsing
    const zonedTemporal = tryParse(Zoned.from, test.format);
    const zonedConvert = tryParse(zoned, test.format);
    console.log(`| Zoned | ${zonedTemporal} | ${zonedConvert} |`);

    // PlainTime parsing
    const timeTemporal = tryParse(PlainTime.from, test.format);
    const timeConvert = tryParse(time, test.format);
    console.log(`| PlainTime | ${timeTemporal} | ${timeConvert} |`);
  }
}

generateParsingTable();
