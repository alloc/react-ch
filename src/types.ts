export type ChannelEffect<T = any, U = any> = (
  ...args: Tuple<T>
) => U | Promise<U>

export type DisposableEffect<T = any, U = any> = {
  effect: ChannelEffect<T, U>
  dispose: () => void
}

export type AsyncFunction = (...args: any[]) => Promise<any>

/**
 * Get a tuple type from any type.
 *
 * - The `any` type becomes the `any[]` type.
 * - The `void` and `never` types become the `[]` type.
 * - Finite array types (aka tuples) stay the same.
 * - All other types become the `[T]` type.
 */
export type Tuple<T = any> = unknown &
  ([T] extends [never]
    ? []
    : [T] extends [Any]
    ? any[]
    : [T] extends [void]
    ? []
    : T extends ReadonlyArray<any>
    ? T[number][] extends T
      ? [T]
      : T
    : [T])

// Used for "any" detection.
declare class Any {
  private _: Any
}
