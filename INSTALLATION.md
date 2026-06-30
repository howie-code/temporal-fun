# Installation & setup

```bash
# With the polyfill (runtimes without native Temporal):
npm install temporal-fun temporal-polyfill

# Native Temporal only:
npm install temporal-fun
```

temporal-fun does not import `temporal-polyfill` itself. It resolves `Temporal` from
`globalThis.Temporal` (native, or polyfill-installed) or from an implementation you
inject with `configure()`, lazily on first use. Pick the setup that fits your runtime.

## A. Native Temporal

Where `Temporal` is native, `globalThis.Temporal` is already present — install
`temporal-fun` alone, no setup:

```ts
import { instant, isAfter } from "temporal-fun";
```

Node 26 enables Temporal by default; for browsers see
[caniuse.com/temporal](https://caniuse.com/temporal). On runtimes without it, use B.

## B. With temporal-polyfill (recommended today)

Install `temporal-polyfill` and import its global once at app entry, before any
temporal-fun call:

```ts
import "temporal-polyfill/global";
import { instant, isAfter } from "temporal-fun";
```

Prefer no `globalThis` mutation? `import "temporal-fun/polyfill"` configures
temporal-polyfill as the provider without touching the global:

```ts
import "temporal-fun/polyfill";
import { instant, isAfter } from "temporal-fun";
```

## C. Explicit configure() (custom implementation)

Inject a specific `Temporal` yourself — a non-polyfill implementation, or full control
over which instance is used. Call `configure()` once at entry, before first use:

```ts
import { configure } from "temporal-fun";
import { Temporal } from "temporal-polyfill";
configure(Temporal);
import { instant, isAfter } from "temporal-fun";
```

`configure()` takes precedence over `globalThis.Temporal`.

## If none of the above

With no native Temporal, no polyfill setup, and no `configure()`, temporal-fun throws an
actionable error on first use.

| Runtime | Install | Setup |
|---|---|---|
| Native Temporal | `temporal-fun` | none |
| No native | `temporal-fun` + `temporal-polyfill` | `import "temporal-polyfill/global"` at entry |
| Custom | `temporal-fun` + any Temporal impl | `configure(Temporal)` |

## Single Temporal instance

temporal-fun assumes one Temporal implementation in the process, and that every Temporal
object you pass in was built by it. That is the point of resolving Temporal from a single
source.

Temporal objects carry private state readable only by the class that created them. If two
copies coexist (two `temporal-polyfill` versions, or polyfill plus native), an object
from one is opaque to the other: `compare`, `.add(...)`, `instanceof`, and conversions
all fail. Brand-sniffing can't fix this — detection would pass but the operations still
fail — so temporal-fun doesn't try. Its guards `instanceof`-check the active
implementation; a foreign object reads as "not a Temporal type".

Dual-instance symptoms: `Unsupported DateLike type: object`, a value that should be a
`PlainDate` failing `isDate`, or `compare` throwing on valid inputs.

To keep a single instance:

- Deduplicate `temporal-polyfill` (`npm ls temporal-polyfill`); align versions or add an
  override. Some bundlers/test-runners need this told to them explicitly — e.g. Vite and
  Vitest: `resolve: { dedupe: ["temporal-polyfill"] }`.
- Avoid ESM/CJS duplication — a package loaded as both yields two class identities.
  `temporal-polyfill` ships a `module-sync` condition so `require` and `import` resolve to
  the same copy on modern Node/bundlers.
- In Next.js / server bundlers, externalize it: `serverExternalPackages: ["temporal-polyfill"]`.
- Install or configure once, at entry, from one source.
