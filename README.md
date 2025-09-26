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
npm install --save temporal-fun temporal-polyfill
```

## Quick Start

```typescript
import { date, dateTime, zoned, dateLike, isDateTime, fmtRelativeToNow, fmtShort, now, startOfWeek, today } from 'temporal-fun';

// Parse & convert
date('2025-03-20')  // PlainDate
dateTime('2025-03-20T15:30:00')  // PlainDateTime
zoned('2024-01-15T18:30[America/New_York]')  // Zoned
zoned('2024-01-15', 'America/New_York')  // Zoned (midnight New York)

date('2025-03-20T15:30:00') // PlainDate (strips time component)
dateTime('2024-01-15')      // PlainDateTime (midnight)

// Current date/time
now()   // Instant
today() // PlainDate

// Parse into union of Temporal types with date component
const parsed = dateLike('2024-01-15T10:30');
if (isDateTime(parsed)) {
  // Type narrowed from DateLike to PlainDateTime
}

// Format dates
fmtShort(plainDate, 'en-US')    // "1/15/24"
fmtRelativeToNow(zonedDateTime, { locales: 'en-US'}) // "2 days ago"

// Date math
const weekStart = startOfWeek(zonedDateTime, 1); // Monday start
```

## Core Concepts

### Naming

Throughout this library:
- **date** refers to `Temporal.PlainDate`
- **time** refers to `Temporal.PlainTime`
- **dateTime** refers to `Temporal.PlainDateTime`
- **zoned** refers to `Temporal.ZonedDateTime`
- **instant** refers to `Temporal.Instant`
- **legacy** refers to the JS built-in `Date`

However, to avoid colliding with the built-in `Date` type/constructor,
temporal-fun keeps the "Plain" prefixes **only** in the type definitions and constructor names.

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
```

## API Categories

### 👷 Constructing

```typescript
import { now, today, nowZoned, PlainDate, PlainDateTime, Instant, Time, Zoned } from 'temporal-fun';

// Current time functions
today();                         // → PlainDate (today)
today('America/New_York');       // → PlainDate (current date in New York)
now();                           // → Instant (current)
nowZoned('America/New_York');    // → ZonedDateTime (now in New York)

// Temporal constructors
PlainDate(year, month, day)
PlainDateTime(year, month, day, hour?, minute?, second?)
Instant(epochNanoseconds)
Zoned(epochNanoseconds, timezone)
PlainTime(hour?, minute?, second?)
```

### 📝 Parsing & Conversion

Construct Temporal types via parsing and/or conversions with intuitive behaviors.

The `date`, `time`, `dateTime`, `zoned`, and `instant` functions have 2 steps:
1. **Parse** strings into the best-fitting Temporal type (if called with strings)
2. **Convert** to the target Temporal type (if not already in target type)

See [PARSING.md](PARSING.md) for a more thorough explanation and comparison of Temporal vs temporal-fun parsing methods:

```typescript
import { dateLike, timeLike, date, dateTime, time, zoned, parseZoned, instant, now, nowZoned, legacy } from 'temporal-fun';

// Parsing
date('2024-01-15');               // → PlainDate
dateTime('2024-01-15T10:30:00');  // → PlainDateTime
time('14:30:00');                 // → PlainTime
instant('2024-01-15T10:30Z');     // → Instant
zoned('2024-01-15T10:30:00[America/New_York]'); // → Zoned

// Parse with automatic conversion
date('2024-01-15T10:30:00');      // → PlainDate (strips time)
dateTime('2024-01-15');           // → PlainDateTime (midnight)
time('2024-01-1514:30:00');       // → PlainTime (stripe date)
instant('2024-01-15');            // → Instant (midnight)
zoned('2024-01-15T10:30Z');       // → Zoned (UTC timezone)

// Converting
date(nowZoned('America/New_York'))  // → PlainDate: same as `today('America/New_York')`
instant(new Date())                 // → Instant: Same as `now()`
instant(date('2024-01-15'))         // → Instant: Same as `instant('2024-01-15')`
zoned(now())                        // → Zoned: Same as `nowZoned('UTC')`
zoned('2024-01-15', 'America/New_York');  // → Zoned: midnight in New York
zoned(new Date(), 'America/New_York');    // → Zoned: Same as `nowZoned('America/New_York')`

// Parse into a union of Temporal types
dateLike('2024-01-15');           // → PlainDate
dateLike('2024-01-15T10:30');     // → PlainDateTime
dateLike('2024-01-15T10:30Z');    // → Instant

// Convert back to legacy Date
legacy(instant('2024-01-15T10:30Z')); // → Date: Same as `new Date('2024-01-15T10:30Z')`
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
fmtShort(d, 'en-GB')  // Overrides the default locale
```

### 📊 Comparison
Compare dates and check relationships.

```typescript
import { compare, isBefore, isAfter, isEqualOrBefore, isEqualOrAfter, isSameDay, isSameWeek, min, max, minMax, rangesOverlap } from 'temporal-fun';

// Basic comparisons
compare(date1, date2);    // -1, 0, or 1
isBefore(date1, date2);           // boolean
isAfter(date1, date2);            // boolean
isEqualOrBefore(date1, date2);    // boolean
isEqualOrAfter(date1, date2);     // boolean

// Min/max
min([date1, date2, date3]);       // returns earliest date
max([date1, date2]);              // returns latest date
minMax([date1, date2, date3]);    // returns [earliest, latest]

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
startOfWeek(date, 1);                    // Monday = 1, Sunday = 0 or 7
endOfWeek(date, 1);                      // End of week
startOfMonth(date);                      // First day of month
endOfMonth(date);                        // Last day of month
startOfYear(date);                       // January 1st
endOfYear(date);                         // December 31st
floor(dateTime, "minute")                // Round down to the minute
ceil(dateTime, "hour")                   // Round up to the hour
round(date, "hour")                      // Round to the nearest hour

// Interval sequences
eachDayOfInterval({ start, end });        // Array of PlainDate
eachWeekOfInterval({ start, end });       // Array of week starts
eachMonthOfInterval({ start, end });      // Array of month starts
eachYearOfInterval({ start, end });       // Array of year starts

stepInterval({ start, end }, { days: 2 }); // array of datelikes from start to end, in 2-day intervals
eachWeekOfInterval({ start, end }, { weekStartsOn: 7 }) // returns the Sunday of each week intersecting [start, end]
```

### 🎨 Formatting
Display dates in human-readable locale-aware formats.

Temporal already provides RFC 9557 (and related) formats via `.toString()`,
and very comprehensive locale-specific formatting via `.toLocaleString()`.

This package provides a few concise, simple formatting functions to cover to most common locale-specific variants.

These generally follow CLDR locale-specific formatting guidance with some timezone-related adjustments for specific types:
- PlainDateTime: never render a timezone
- Zoned: always render a timezone
- Instant: always render in UTC

```typescript
import { fmtRelativeToNow, fmtShort, fmtMedium, fmtLong } from 'temporal-fun';

// Relative formatting
fmtRelativeToNow(date, { locales: 'en-US' }); // "2 days ago"

// Short/medium/long formatting helpers
fmtShort(date, 'en-US');        // "3/24/25"
fmtMedium(date, 'en-US');       // "Mar 24, 2025"
fmtLong(dateTime, 'en-US');     // "March 24, 2025 at 8:30 AM"
fmtFull(dateTime, 'en-US');      // "Monday, March 24, 2025 at 8:30:05 AM"
```

Note: The installed ICU/locales can affect this formatting, especially for loosely specified format details like separators and spacing. Examples renderings for select locales (generated by `bin/locale-formats.ts <locales>`):

| Format | en-US | en-GB | es-ES | zh-CN |
|---|---|---|---|---|
| PlainDate short      | 3/24/25 | 24/03/2025 | 24/3/25 | 2025/3/24 |
| PlainDate medium     | Mar 24, 2025 | 24 Mar 2025 | 24 mar 2025 | 2025年3月24日 |
| PlainDate long       | March 24, 2025 | 24 March 2025 | 24 de marzo de 2025 | 2025年3月24日 |
| PlainDate full       | Monday, March 24, 2025 | Monday, 24 March 2025 | lunes, 24 de marzo de 2025 | 2025年3月24日 星期一 |
| PlainTime short      | 8:30 AM | 08:30 | 8:30 | 08:30 |
| PlainTime medium     | 8:30:05 AM | 08:30:05 | 8:30:05 | 08:30:05 |
| PlainTime long       | 8:30:05 AM | 08:30:05 | 8:30:05 | 08:30:05 |
| PlainTime full       | 8:30:05 AM | 08:30:05 | 8:30:05 | 08:30:05 |
| PlainDateTime short  | 3/24/25, 8:30 AM | 24/03/2025, 08:30 | 24/3/25, 8:30 | 2025/3/24 08:30 |
| PlainDateTime medium | Mar 24, 2025 at 8:30 AM | 24 Mar 2025 at 08:30 | 24 mar 2025, 8:30 | 2025年3月24日 08:30 |
| PlainDateTime long   | March 24, 2025 at 8:30 AM | 24 March 2025 at 08:30 | 24 de marzo de 2025, 8:30 | 2025年3月24日 08:30 |
| PlainDateTime full   | Monday, March 24, 2025 at 8:30:05 AM | Monday, 24 March 2025 at 08:30:05 | lunes, 24 de marzo de 2025, 8:30:05 | 2025年3月24日 星期一 08:30:05 |
| Zoned short          | 3/24/25, 8:30 AM EDT | 24/03/2025, 08:30 GMT-4 | 24/3/25, 8:30 GMT-4 | 2025/3/24 08:30GMT-4 |
| Zoned medium         | Mar 24, 2025 at 8:30 AM EDT | 24 Mar 2025 at 08:30 GMT-4 | 24 mar 2025, 8:30 GMT-4 | 2025年3月24日 08:30GMT-4 |
| Zoned long           | March 24, 2025 at 8:30 AM Eastern Daylight Time | 24 March 2025 at 08:30 Eastern Daylight Time | 24 de marzo de 2025, 8:30 hora de verano oriental | 2025年3月24日 08:30北美东部夏令时间 |
| Zoned full           | Monday, March 24, 2025 at 8:30:05 AM Eastern Daylight Time | Monday, 24 March 2025 at 08:30:05 Eastern Daylight Time | lunes, 24 de marzo de 2025, 8:30:05 (hora de verano oriental) | 2025年3月24日 星期一 北美东部夏令时间 08:30:05 |
| Instant short        | 3/24/25, 1:30 PM UTC | 24/03/2025, 13:30 UTC | 24/3/25, 13:30 UTC | 2025/3/24 13:30UTC |
| Instant medium       | Mar 24, 2025 at 1:30 PM UTC | 24 Mar 2025 at 13:30 UTC | 24 mar 2025, 13:30 UTC | 2025年3月24日 13:30UTC |
| Instant long         | March 24, 2025 at 1:30 PM UTC | 24 March 2025 at 13:30 UTC | 24 de marzo de 2025, 13:30 UTC | 2025年3月24日 13:30UTC |
| Instant full         | Monday, March 24, 2025 at 1:30:05 PM Coordinated Universal Time | Monday, 24 March 2025 at 13:30:05 Coordinated Universal Time | lunes, 24 de marzo de 2025, 13:30:05 (tiempo universal coordinado) | 2025年3月24日 星期一 协调世界时 13:30:05 |


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

### ✅ Validation

Validate if a string can be parsed into a given Temporal type.

```typescript
import { isValidDateString, isValidTimeString, isValidZonedString } from 'temporal-fun';

// Validation
isValidDateString('2024-01-15'); // true
isValidTimeString('25:30'); // false
isValidDateTimeString('2024-01-15 25:30') // true
isValidInstant('2024-01-15'); // false
isValidZonedString('2024-01-15T10:30:00[America/New_York]') // true
```
