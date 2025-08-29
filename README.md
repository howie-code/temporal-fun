# temporal-fun

A modern date utility library for working with the [Temporal API](https://tc39.es/proposal-temporal/).

## Features

- 🌟 **Temporal Native**: Built specifically for the modern Temporal API
- 🔒 **Pure Functions**: All functions are immutable and side-effect free
- 📝 **TypeScript First**: Fully typed with excellent LSP support
- ⚡ **Concise API**: Short names for the most common functionality (e.g. `date("2025-08-28")`)
- 💪 **Zero Dependencies**: Only requires `temporal-polyfill` as a peer dependency

## Installation

```bash
npm install temporal-fun temporal-polyfill
```

## Quick Start

```typescript
import { date, dateTime, zoned, dateLike, isDateTime, fmtRelativeToNow, fmtShort, startOfWeek } from 'temporal-fun';

// Direct conversion functions
const plainDate = date('2024-01-15T10:30:00');  // → PlainDate (strips time)
const plainDateTime = dateTime('2024-01-15');   // → PlainDateTime (adds 00:00 time)
const zonedDateTime = zoned('2024-01-15T18:30', 'America/New_York'); // → ZonedDateTime

// Smart conversion with dateLike()
const parsed = dateLike('2024-01-15T10:30');  // PlainDateTime (inferred type is DateLike)

// Type narrowing from DateLike to PlainDateTime
if (isDateTime(parsed)) {
  console.log(parsed.hour); // TypeScript knows this has a time component
}

// Format dates
fmtRelativeToNow(zonedDateTime); // "2 days ago"
fmtShort(plainDate, 'en-US');    // "1/15/24"

// Date math
const weekStart = startOfWeek(zonedDateTime, 1); // Monday start
```

## Core Concepts

### Naming

Throughout this library:
- "date" refers to `Temporal.PlainDate`
- "time" refers to `Temporal.PlainTime`
- "dateTime" refers to `Temporal.PlainDateTime`
- "zoned" refers to `Temporal.ZonedDateTime`
- "instant" refers to `Temporal.Instant`
- "legacy" refers to the JS built-in `Date`

However, to avoid colliding with the built-in `Date` type/constructor
temporal-fun keep the "Plain" prefixes **only** in the type definitions and constructor names.

```typescript
// Constructor & type aliases
const PlainDate = Temporal.PlainDate;
const PlainDateTime = Temporal.PlainDateTime;
const Zoned = Temporal.ZonedDateTime;
const PlainTime = Temporal.PlainTime;
const Instant = Temporal.Instant;

// Union types
type DateLike = PlainDate | PlainDateTime | Zoned | Instant;  // Types with date component
type TimeLike = PlainTime | PlainDateTime | Zoned | Instant;  // Types with time component
type IntoDateLike = DateLike | Date | string;    // Inputs convertible to DateLike
type IntoTimeLike = TimeLike | Date | string;    // Inputs convertible to TimeLike
```

### Main Entry Points

The library provides concise helper functions for common operations:

- **`date(input)`, `dateTime(input)`, `time(input)`**: Direct conversion to specific types
- **`zoned(input, timezone)`**: Create ZonedDateTime from any IntoDateLike input
- **`dateLike(input)`**: Smart conversion of any input to appropriate DateLike type
- **`timeLike(input)`**: Time-focused conversion to TimeLike types

The `date`, `dateTime`, `time`, `instant`, and `zoned` functions will parse and/or convert into
specific Temporal types (adding or remove date-time components as needed).

The `parseDate`, `parseDateTime`, `parseTime`, `parseInstant`, `parseZoned` only perform the parsing.
These functions are similar to Temporal's `from` methods but gracefully handle some additional formats.


## API Categories

### 🔄 Conversion
Convert between different date formats and types with intelligent defaults.

```typescript
import { dateLike, timeLike, date, dateTime, time, zoned, parseZoned, instant, now, today, nowZoned, legacy } from 'temporal-fun';

// Current time functions
now();                           // → Instant (current)
today();                         // → PlainDate (today)
nowZoned('America/New_York');    // → ZonedDateTime (now in timezone)

// Direct conversion
date('2024-01-15T10:30:00');      // → PlainDate (strips time)
dateTime('2024-01-15');           // → PlainDateTime (adds 00:00 time)
time('14:30:00');                 // → PlainTime
instant('2024-01-15T10:30Z');     // → Instant
instant(new Date())               // → Instant (but `now()` is preferred)

// ZonedDateTime creation
zoned('2024-01-15', 'America/New_York');        // → ZonedDateTime
zoned(new Date(), 'America/New_York');          // → ZonedDateTime

// Explicit parsing
parseZoned('2024-01-15T10:30:00[America/New_York]'); // → ZonedDateTime

// Union conversion
dateLike('2024-01-15');           // → PlainDate
dateLike('2024-01-15T10:30');     // → PlainDateTime
dateLike('2024-01-15T10:30Z');    // → Instant

// Convert back to legacy Date
legacy(instant('2024-01-15T10:30Z')); // → Date
```

### 🔍 Type Guards
Check what type of Temporal object you're working with.

Each of these guards will narrow a `DateLike` or `TimeLike` type.

```typescript
import { isDate, isDateTime, isZoned, isTime, isInstant, isDateLike, isTimeLike } from 'temporal-fun';

if (isDate(someValue)) {
  // TypeScript knows someValue is PlainDate
  console.log(someValue.toString());
}

if (isZoned(someValue)) {
  // TypeScript knows someValue is ZonedDateTime
  console.log(someValue.timeZoneId);
}

if (isDateLike(someValue)) {
  // Has date component (PlainDate | PlainDateTime | Zoned | Instant)
}

if (isTimeLike(someValue)) {
  // Has time component (PlainTime | PlainDateTime | Zoned | Instant)
}
```

### 🌎 Locales

Several formatting, comparison, math, and timezone functions accept locale(s) and/or weekStartsOn arguments
which can be specified locally or globally.

```typescript
import { setLocales } from 'temporal-fun';

const d = date("2025-03-20");

setLocales('en-US');  // Sets the default locale
startOfWeek(d)        // Uses Sunday as start-of-week (based on default locale)
fmtShort(d)           // Uses en-US locale (based on default locale)
fmtShort(d, { locales: 'en-GB' })  // Overrides the default locale
```

### 📊 Comparison
Compare dates and check relationships.

```typescript
import { compareDateLike, isBefore, isAfter, isEqualOrBefore, isEqualOrAfter, isSameDay, isSameWeek, rangesOverlap } from 'temporal-fun';

// Basic comparisons
compareDateLike(date1, date2);    // -1, 0, or 1
isBefore(date1, date2);           // boolean
isAfter(date1, date2);            // boolean
isEqualOrBefore(date1, date2);    // boolean
isEqualOrAfter(date1, date2);     // boolean

// Day/week comparison
isSameDay(date1, date2);          // boolean
isSameWeek(date1, date2, 1);      // boolean (weekStartsOn: 1 = Monday)

// Range overlap
rangesOverlap([start1, end1], [start2, end2]); // boolean
```


### 🧮 Math & Manipulation
Start/end of periods, intervals, and date sequences.

```typescript
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, stepInterval, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, eachYearOfInterval } from 'temporal-fun';

// Start/end of periods
startOfDay(dateTime);                    // Set time to 00:00:00
endOfDay(date);                          // Set time to 23:59:59.999
startOfWeek(date, 1);                    // Monday start (1), Sunday = 0
endOfWeek(date, 1);                      // End of week
startOfMonth(date);                      // First day of month
endOfMonth(date);                        // Last day of month
startOfYear(date);                       // January 1st
endOfYear(date);                         // December 31st

// Interval sequences
eachDayOfInterval({ start, end });        // Array of PlainDate
eachWeekOfInterval({ start, end });       // Array of week starts
eachMonthOfInterval({ start, end });      // Array of month starts
eachYearOfInterval({ start, end });       // Array of year starts

stepInterval({ start, end }, { days: 2 }); // array of datelikes from start to end, in 2-day intervals
eachWeekOfInterval({ start, end }, { weekStartsOn: 7 }) // returns the Sunday of each week intersecting [start, end]
```

### 🎨 Formatting
Display dates in human-readable locale-aware formats with predefined format constants.

Temporal already provides RFC 9557 (and related) formats via `.toString()`,
and veriy comprehensive locale-specific formatting via `.toLocaleString()`.

This package provides a few concise, simple formatting functions to cover to most common locale-specific variants
and additional const for concisely constructing new variants.

```typescript
import { fmtRelativeToNow, fmtShort, fmtMedium, fmtLong } from 'temporal-fun';

// Relative formatting
fmtRelativeToNow(date, { locales: 'en-US' }); // "2 days ago"

// Short/medium/long formatting helpers
fmtShort(date, { locales: 'en-US' });        // "3/24/25"
fmtMedium(date, { locales: 'en-US' });       // "Mar 24, 2025"
fmtLong(dateTime, { locales: 'en-US' });     // "March 24, 2025 at 08:30:05"
```

Use the formatting constants directly to easily construct new formatting constants:

```typescript
import { DateFmt } from 'temporal-fun';

const weekdayShort = {...DateFmt.Short, weekday: "short"}

date.toLocaleString('en-US', DateFmt.Short);           // "3/24/25"
date.toLocaleString("en-US", weekdayShort);            // "Mon 3/24/25"

```

The full list of built-in format consts:

```typescript
import { DateFmt, TimeFmt, DateTimeFmt, ZonedFmt, InstantFmt } from 'temporal-fun';

// Date formats
date.toLocaleString('en-US', DateFmt.Short);           // "3/24/25"
date.toLocaleString('en-US', DateFmt.Medium);          // "Mar 24, 2025"
date.toLocaleString('en-US', DateFmt.Long);            // "March 24, 2025"

// Time formats
time.toLocaleString('en-US', TimeFmt.Short12h);        // "8:30 AM"
time.toLocaleString('en-US', TimeFmt.Long12h);         // "8:30:05 AM"
time.toLocaleString('en-US', TimeFmt.Short24h);        // "08:30"
time.toLocaleString('en-US', TimeFmt.Long24h);         // "08:30:05"

// DateTime formats
dateTime.toLocaleString('en-US', DateTimeFmt.Short12h);  // "3/24/25, 8:30 AM"
dateTime.toLocaleString('en-US', DateTimeFmt.Medium12h); // "Mar 24, 2025, 8:30 AM"
dateTime.toLocaleString('en-US', DateTimeFmt.Long12h);   // "March 24, 2025 at 8:30:05 AM"
dateTime.toLocaleString('en-US', DateTimeFmt.Short24h);  // "3/24/25, 08:30"
dateTime.toLocaleString('en-US', DateTimeFmt.Long24h);   // "March 24, 2025 at 08:30:05"

// ZonedDateTime formats
zoned.toLocaleString('en-US', ZonedFmt.Short12h);      // "3/24/25, 8:30 AM PDT"
zoned.toLocaleString('en-US', ZonedFmt.Medium12h);     // "Mar 24, 2025, 8:30 AM PDT"
zoned.toLocaleString('en-US', ZonedFmt.Long12h);       // "March 24, 2025 at 8:30:05 AM Pacific Daylight Time"

// Instant formats (always UTC)
instant.toLocaleString('en-US', InstantFmt.Short);     // "3/24/25, 20:30"
instant.toLocaleString('en-US', InstantFmt.Medium);    // "Mar 24, 2025, 20:30"
instant.toLocaleString('en-US', InstantFmt.Long);      // "March 24, 2025 at 20:30:05 UTC"
```


### 🌍 Timezone
Work with timezones and timezone information.

```typescript
import { getAllTimezones, isValidTimezone, getTimezoneName, getGMTOffset } from 'temporal-fun';

// Get all available timezones
getAllTimezones();                          // Array of IANA timezone strings

// Validate timezone
isValidTimezone('America/New_York');        // true
isValidTimezone('Invalid/Zone');            // false

// Get timezone display name
getTimezoneName(zonedDateTime);             // "EST" or "EDT" (depends on date)
getTimezoneName(zonedDateTime, { style: 'long', locale: 'en-US' }); // "Eastern Standard Time"

// Format GMT offset
getGMTOffset(300);                          // "GMT+5:00" (300 minutes = 5 hours)
getGMTOffset(-330);                         // "GMT-5:30" (India offset)
```

### 📝 Parsing
Parse various date/time string formats (primarily RFC 9557) via Temporal `from` methods handling a few extra cases:
- `parseDateTime` supports 'T' or ' ' separator
- `parseZoned` corrects offset-timezone mismatches
- `parseTime` detects AM/PM suffixes


```typescript
import { parseDate, parseDateTime, parseZoned, parseTime, parseTimeFrom12Hour, parseInstant, parseDateLike, parseTimeLike, isValidDateString, isValidTimeString } from 'temporal-fun';

// Direct parsing
parseDate('2024-01-15');                    // → PlainDate
parseDateTime('2024-01-15T10:30:00');       // → PlainDateTime
parseZoned('2024-01-15T10:30:00[America/New_York]'); // → ZonedDateTime
parseTime('14:30:00');                      // → PlainTime
parseTimeFrom12Hour('2:30 PM');             // → PlainTime (14:30:00)
parseInstant('2024-01-15T10:30:00Z');       // → Instant

// Union parsing
parseDateLike('2024-01-15');                // → PlainDate
parseDateLike('2024-01-15T10:30:00Z');      // → Instant
parseTimeLike('2:30 PM');                   // → PlainTime

// Validation
isValidDateString('2024-01-15');            // true
isValidTimeString('25:30');                 // false
```
