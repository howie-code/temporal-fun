import type { Temporal } from "temporal-spec";

/** The runtime `globalThis.Temporal` object (constructors + `Now`). */
export type TemporalImpl = typeof Temporal;

let injected: TemporalImpl | undefined;
let cached: TemporalImpl | undefined;

/**
 * Provide the Temporal implementation explicitly instead of relying on
 * `globalThis.Temporal`. Call once at app entry, before the first temporal-fun call.
 * Takes precedence over the global.
 */
export function configure(temporal: TemporalImpl): void {
  injected = temporal;
  cached = undefined;
}

/**
 * Resolve the active Temporal lazily (injection, else `globalThis.Temporal`).
 * Lazy so host setup order doesn't matter — Temporal need only exist before first use.
 *
 * @throws if no Temporal is available.
 */
export function getTemporal(): TemporalImpl {
  cached ??= injected ?? (globalThis as { Temporal?: TemporalImpl }).Temporal;
  if (!cached) {
    throw new Error(
      "temporal-fun: no Temporal implementation found. On a runtime without native " +
        'Temporal, `import "temporal-polyfill/global"` once at app entry, or ' +
        '`import "temporal-fun/polyfill"` (no globalThis), or call configure(Temporal).',
    );
  }
  return cached;
}

/** Implementation keys that are Temporal classes (everything but `Now`). */
type ConstructorKey = {
  [K in keyof TemporalImpl]: TemporalImpl[K] extends { new (...args: never[]): unknown }
    ? K
    : never;
}[keyof TemporalImpl];

/**
 * A stand-in for a Temporal class that forwards to the active implementation,
 * resolved lazily — lets temporal-fun re-export the constructors (`PlainDate`, …)
 * without capturing a Temporal reference at module load.
 */
export function lazyConstructor<K extends ConstructorKey>(key: K): TemporalImpl[K] {
  const resolve = (): Record<PropertyKey, unknown> =>
    getTemporal()[key] as unknown as Record<PropertyKey, unknown>;

  // Empty class (not a function) so the Proxy is constructable: `new`/`instanceof` work.
  return new Proxy(class {} as unknown as TemporalImpl[K], {
    get(_target, prop) {
      const impl = resolve();
      const value = impl[prop];
      // Bind methods to the real class for correct `this`; pass data props through.
      return typeof value === "function" ? (value as (...a: never[]) => unknown).bind(impl) : value;
    },
    has(_target, prop) {
      return prop in resolve();
    },
    apply(_target, _thisArg, args) {
      return (resolve() as unknown as (...a: unknown[]) => unknown)(...(args as unknown[]));
    },
    construct(_target, args) {
      return Reflect.construct(
        resolve() as unknown as new (
          ...a: unknown[]
        ) => object,
        args as unknown[],
      );
    },
  });
}
