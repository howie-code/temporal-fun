export type IsUnion<T, U = T> = T extends unknown
  ? [U] extends [T]
    ? false
    : true
  : never;
export type Concrete<T> = IsUnion<T> extends true ? never : T;
