## Parsing

Temporal-fun functions (`date`, `time`, `dateTime`, `zoned`, and `instant`) are often redundant of Temporal `from` methods for parsing dates/times. For example, both of these parse into equivalent `PlainDate` instances:
- Temporal: `PlainDate.from("2025-03-20")`
- temporal-fun: `date("2025-03-20")`

There are however differences, where temporal-fun is willing to make some assumptions and/or coerce a bit more than Temporal:
- `instant` will assume UTC if not provided in the original string
- `dateTime`, `instant`, and `zoned` will assume midnight if time is absent from the original string
- `zoned` will parse ISO-8601 strings and treat the offset as the timezone, but otherwise requires an explicit timezone
- `time` will parse 12-hour time stings
- `zoned` will also auto-correct timezone/offset mismatches

## Format: "2025-03-20T14:30:00Z"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | 2025-03-20T14:30:00Z | 2025-03-20T14:30:00Z |
| PlainDate | Error | 2025-03-20 |
| PlainDateTime | Error | 2025-03-20T14:30:00 |
| Zoned | Error | 2025-03-20T14:30:00+00:00[UTC] |
| PlainTime | Error | 14:30:00 |

## Format: "2025-03-20T14:30:00-08:00"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | 2025-03-20T22:30:00Z | 2025-03-20T22:30:00Z |
| PlainDate | 2025-03-20 | 2025-03-20 |
| PlainDateTime | 2025-03-20T14:30:00 | 2025-03-20T14:30:00 |
| Zoned | Error | 2025-03-20T14:30:00-08:00[-08:00] |
| PlainTime | 14:30:00 | 14:30:00 |

## Format: "2025-03-20"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | Error | 2025-03-20T00:00:00Z |
| PlainDate | 2025-03-20 | 2025-03-20 |
| PlainDateTime | 2025-03-20T00:00:00 | 2025-03-20T00:00:00 |
| Zoned | Error | Error |
| PlainTime | Error | Error |

## Format: "2025-03-20T14:30:00"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | Error | 2025-03-20T14:30:00Z |
| PlainDate | 2025-03-20 | 2025-03-20 |
| PlainDateTime | 2025-03-20T14:30:00 | 2025-03-20T14:30:00 |
| Zoned | Error | Error |
| PlainTime | 14:30:00 | 14:30:00 |

## Format: "2025-03-20T14:30:00-04:00[America/New_York]"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | 2025-03-20T18:30:00Z | 2025-03-20T18:30:00Z |
| PlainDate | 2025-03-20 | 2025-03-20 |
| PlainDateTime | 2025-03-20T14:30:00 | 2025-03-20T14:30:00 |
| Zoned | 2025-03-20T14:30:00-04:00[America/New_York] | 2025-03-20T14:30:00-04:00[America/New_York] |
| PlainTime | 14:30:00 | 14:30:00 |

## Format: "2025-06-16T17:00:00-04:00[America/Asuncion]"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | 2025-06-16T21:00:00Z | 2025-06-16T21:00:00Z |
| PlainDate | 2025-06-16 | 2025-06-16 |
| PlainDateTime | 2025-06-16T17:00:00 | 2025-06-16T18:00:00 |
| Zoned | Error | 2025-06-16T18:00:00-03:00[America/Asuncion] |
| PlainTime | 17:00:00 | 18:00:00 |

## Format: "14:30:00"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | Error | Error |
| PlainDate | Error | Error |
| PlainDateTime | Error | Error |
| Zoned | Error | Error |
| PlainTime | 14:30:00 | 14:30:00 |

## Format: "07:30 pm"
| Type | Temporal | temporal-fun |
|------|---------------|-----------------|
| Instant | Error | Error |
| PlainDate | Error | Error |
| PlainDateTime | Error | Error |
| Zoned | Error | Error |
| PlainTime | Error | 19:30:00 |


**Zoned timezone/offset mismatches**: `zoned` corrects mismatches between offset and timezone. Example: "2025-06-16T17:00:00-04:00[America/Asuncion]" is invalid because Paraguay stopped observing DST in 2025, but this string was considered valid until the IANA database was updated.
  - `Zoned.from` throws an error
  - `zoned` parses to the offset time and adjusts it to the named timezone, in this case "**18**:00:00-**03**:00" instead
