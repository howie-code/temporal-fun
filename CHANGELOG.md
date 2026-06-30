# Changelog

## Unreleased

### Breaking

- **temporal-fun no longer imports `temporal-polyfill`.** It now resolves `Temporal`
  from `globalThis.Temporal` (native or installed via `temporal-polyfill/global`) or
  from an explicit `configure(Temporal)` injection. `temporal-polyfill` is now an
  **optional** peer dependency.

  Non-native consumers who relied on the bundled polyfill auto-loading must now
  provide Temporal themselves — pick one:
  - `import "temporal-polyfill/global"` once at app entry (recommended today), or
  - `configure(Temporal)` for a side-effect-free setup.

  See [INSTALLATION.md](./INSTALLATION.md) for the full matrix.

- **Timezone API standardized on `tz`.** Renamed the timezone helpers and aligned
  their options/arguments:
  - `isValidTimezone(tz)` → `isValidTz(tz)`
  - `getTimezoneName(zdt, { style, locale })` → `fmtTz(zdt, { style, locales })`
    (the `locale` option is now `locales`)
  - `getGMTOffset(minutes)` → `tzOffset(zdt)` (now takes a `ZonedDateTime`, not a
    minute count)
  - the optional timezone argument of `nowZoned`, `today`, and `zoned` is renamed
    `timezone` → `tz` (positional callers are unaffected).

### Added

- `configure(Temporal)` and `getTemporal()` exports for explicit, side-effect-free
  Temporal injection.
- `temporal-fun/polyfill` convenience entry — `import "temporal-fun/polyfill"` wires
  temporal-polyfill via `configure()` (no `globalThis` mutation), in one line.
- `localTz()` — the system timezone id (e.g. `"America/New_York"`).
- `tzOffsetMinutes(zdt)` — the zone's offset from UTC in minutes.
- `temporal-spec` as a (types-only, zero-runtime) regular dependency, supplying the
  Temporal type definitions independent of any runtime implementation.
- `require("temporal-fun")` now works (previously `ERR_PACKAGE_PATH_NOT_EXPORTED`).
  The package stays ESM-only but adds a `module-sync` export condition, so `require()`
  loads the ESM build via Node's require(ESM) as a single instance. Requires Node
  ≥22 (`engines`); `import` works more broadly.

### Changed

- Type guards (`isDate`, `isInstant`, …) now `instanceof`-check against the single
  active Temporal implementation (`getTemporal()`), instead of a polyfill copy
  captured at import time. temporal-fun expects **one** Temporal class instance in the
  process; mixing objects from two different Temporal copies remains unsupported (their
  internal state isn't cross-readable, so `.compare`/`.add`/conversions fail regardless
  of any guard). See [Single Temporal instance](./INSTALLATION.md#single-temporal-instance).
- Supported `temporal-polyfill` range widened to `>=0.2.5 || ^1.0.0`.

### Fixed

- `fmtShort`/`fmtMedium`/`fmtLong` now place the timezone name correctly for
  `ZonedDateTime`/`Instant` values (locale-aware position).
- `tzOffset` sign is correct for negative whole-hour offsets.
