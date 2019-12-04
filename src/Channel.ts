import { AsyncFunction, ChannelEffect, DisposableEffect, Tuple } from './types'

export interface Channel<T = any, U = any> {
  (...args: Tuple<T>): Promise<U[]>
  once(effect: ChannelEffect<T, U>): DisposableEffect<T, U>
}

/**
 * Channels allow for loose coupling between a function call and its effect(s).
 */
export class Channel<T = any, U = any> {
  /** The channel name. Useful for debugging. */
  readonly name!: string
  protected effects!: Set<ChannelEffect<T, U>>

  /** Override this to wrap every channel emitter. */
  static wrapEmit: AsyncFunction = emit => emit

  constructor(name?: string) {
    const effects = new Set<ChannelEffect<T, U>>()
    const channel: any = Channel.wrapEmit((...args: Tuple<T>) =>
      Promise.all(Array.from(effects, effect => effect(...args)))
    )

    Object.setPrototypeOf(channel, Channel.prototype)
    if (name) Object.defineProperty(channel, 'name', { value: name })
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
