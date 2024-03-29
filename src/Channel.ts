import { is } from '@alloc/is'
import { AsyncFunction, ChannelEffect, DisposableEffect } from './types'

export type ChannelArgs<T> = Parameters<ChannelEffect<T>>

export interface Channel<T = void, U = any> {
  (...args: ChannelArgs<T>): Promise<U[]>
  once(effect: ChannelEffect<T, U>): DisposableEffect<T, U>
  /** The channel name. Useful for debugging. */
  readonly name: string
  readonly effects: ReadonlySet<ChannelEffect<T, U>>
}

/**
 * Channels allow for loose coupling between a function call and its effect(s).
 * They are very similar to event emitters.
 *
 * Its `T` type is either the first and only argument type passed to the channel
 * (eg: `T = number`), or an array type representing varargs of the channel
 * (eg: `T = [number, string] | number[]`).
 *
 * Its `U` type is the expected return type of any effect functions that react
 * to the channel.
 */
export class Channel<T = void, U = any> implements Function {
  /** Override this to wrap every channel emitter. */
  static wrapEmit = (emit: AsyncFunction) => emit

  constructor(name?: string, effect?: ChannelEffect<T, U>)
  constructor(effect: ChannelEffect<T, U>)
  constructor(arg1?: string | ChannelEffect, arg2?: ChannelEffect) {
    const effects = new Set<ChannelEffect>()
    const channel: any = Channel.wrapEmit((...args: any[]) =>
      Promise.all(Array.from(effects, effect => effect(...args)))
    )

    Object.setPrototypeOf(channel, Channel.prototype)
    if (arg1) {
      if (is.string(arg1)) {
        Object.defineProperty(channel, 'name', { value: arg1 })
      } else {
        effects.add(arg1)
      }
    }
    if (arg2) {
      effects.add(arg2)
    }
    channel.effects = effects
    return channel
  }

  /** Listen until disposed. */
  on(effect: ChannelEffect<T, U>): DisposableEffect<T, U> {
    const effects = this.effects as Set<ChannelEffect<T, U>>
    effects.add(effect)
    return {
      effect,
      dispose: () => {
        effects.delete(effect)
      },
    }
  }

  /** Listen for the next call or until disposed. */
  once(effect: ChannelEffect<T, U>): DisposableEffect<T, U> {
    const once = (this as any).on(
      (...args: any) => (once.dispose(), (effect as any)(...args))
    )
    once.effect = effect
    return once
  }
}

// Ensure `instanceof Function` returns true for Channel objects.
// Use `setPrototypeOf` instead of `extends` so a Function object
// is not created by `super` only to be thrown away.
Object.setPrototypeOf(Channel.prototype, Function.prototype)
