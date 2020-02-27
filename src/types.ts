export type ChannelEffect<T = any, U = any> = [T] extends [Any]
  ? (...args: any[]) => U | Promise<U>
  : [T] extends [void]
  ? () => U | Promise<U>
  : [T] extends [ReadonlyArray<any>]
  ? (...args: T) => U | Promise<U>
  : (arg: T) => U | Promise<U>

export type DisposableEffect<T = any, U = any> = {
  effect: ChannelEffect<T, U>
  dispose: () => void
}

export type AsyncFunction = (...args: any[]) => Promise<any>

// Used for "any" detection.
declare class Any {
  private _: Any
}
