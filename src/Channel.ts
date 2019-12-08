import is from '@alloc/is'
import { AsyncFunction, ChannelEffect, DisposableEffect, Tuple } from './types'

export interface Channel<T = any, U = any> {
  (...args: Tuple<T>): Promise<U[]>
  once(effect: ChannelEffect<T, U>): DisposableEffect<T, U>
}

/**
 * Channels allow for loose coupling between a function call and its effect(s).
 *
 * Its `T` type is either the first and only argument type passed to the channel
 * (eg: `T = number`), or an array type representing varargs of the channel
 * (eg: `T = [number, string] | number[]`).
 *
 * Its `U` type is the expected return type of any effect functions that react
 * to the channel (eg: `U = Promise<void> | void`).
 */
export class Channel<T = any, U = any> {
  /** The channel name. Useful for debugging. */
  readonly name!: string
  protected effects!: Set<ChannelEffect<T, U>>

  /** Override this to wrap every channel emitter. */
  static wrapEmit: AsyncFunction = emit => emit

  constructor(name?: string, effect?: ChannelEffect<T, U>)
  constructor(effect: ChannelEffect<T, U>)
  constructor(arg1?: string | ChannelEffect, arg2?: ChannelEffect) {
    const effects = new Set<ChannelEffect>()
    const channel: any = Channel.wrapEmit((...args: Tuple<T>) =>
      Promise.all(Array.from(effects, effect => effect(...args)))
    )

    Object.setPrototypeOf(channel, Channel.prototype)
    if (arg1) {
      if (is.string(arg1)) {
        Object.defineProperty(channel, 'name', { value: name })
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
    this.effects.add(effect)
    return {
      effect,
      dispose: () => {
        this.effects.delete(effect)
      },
    }
  }

  /** Listen for the next call or until disposed. */
  once(effect: ChannelEffect<T, U>): DisposableEffect<T, U> {
    const once = this.on(
      (...args: any): any => (once.dispose(), effect(...args))
    )
    once.effect = effect
    return once
  }
}

const ch = new Channel()
ch.name
