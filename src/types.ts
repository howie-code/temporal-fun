import { Temporal } from "temporal-polyfill";

export const PlainDate = Temporal.PlainDate;
export const PlainDateTime = Temporal.PlainDateTime;
export const Zoned = Temporal.ZonedDateTime;
export const PlainTime = Temporal.PlainTime;
export const Instant = Temporal.Instant;
export type PlainDate = Temporal.PlainDate;
export type PlainDateTime = Temporal.PlainDateTime;
export type Zoned = Temporal.ZonedDateTime;
export type PlainTime = Temporal.PlainTime;
export type Instant = Temporal.Instant;

/**
 * Temporal types that have a date component
 */
export type DateLike = PlainDate | PlainDateTime | Zoned | Instant;

/**
 * Temporal types that have a time component
 */
export type TimeLike = PlainTime | PlainDateTime | Zoned | Instant;

/**
 * Input types that can be converted to DateLike
 */
export type IntoDateLike = DateLike | Date | string;

/**
 * Input types that can be converted to TimeLike
 */
export type IntoTimeLike = TimeLike | Date | string;

/**
 * Week start options (0 = Sunday, 1 = Monday)
 */
export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

/**
 * Time interval represented as a tuple of start and end dates
 */
export type Interval<T extends DateLike = DateLike> = readonly [T, T];
