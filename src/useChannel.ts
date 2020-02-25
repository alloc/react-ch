import { is } from '@alloc/is'
import React from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import { Channel } from './Channel'
import { ChannelEffect } from './types'

const noop = Function.prototype

/** Add an effect to a channel */
export function useChannel<T, U = void>(
  channel: Channel<T, U> | undefined,
  effect: ChannelEffect<T, U> | undefined,
  deps?: any[]
): void

/** Create a channel */
export function useChannel<T, U = void>(name?: string): Channel<T, U>

/** Create a channel with an effect */
export function useChannel<T, U = void>(
  effect: ChannelEffect<T, U>,
  deps?: any[]
): Channel<T, U>

/** Create a channel with an effect */
export function useChannel<T, U = void>(
  name: string,
  effect: ChannelEffect<T, U> | undefined,
  deps?: any[]
): Channel<T, U>

/** @internal */
export function useChannel(
  arg1?: string | Channel | ChannelEffect,
  arg2?: ChannelEffect | any[],
  arg3?: any[]
) {
  const name = is.string(arg1) ? arg1 : ''

  const channel =
    arguments.length > 1 && (arg1 == null || arg1 instanceof Channel)
      ? arg1
      : React.useState(() => new Channel(name))[0]

  const effect: any =
    channel && arg1 !== channel && is.function(arg1) ? arg1 : arg2

  if (arguments.length > 1 || (effect && arg1 == effect)) {
    // Replace the effect without changing call order.
    const effectRef = React.useRef<ChannelEffect>(effect)
    useLayoutEffect(
      () => {
        effectRef.current = effect || noop
      },
      // The deps array decides when the effect is replaced.
      is.array(arg2) ? arg2 : arg3
    )

    // Start listening on commit, and stop on unmount.
    useLayoutEffect(
      () =>
        channel && channel.on((...args) => effectRef.current(...args)).dispose,
      [channel]
    )
  }

  // Return the channel only if we created it.
  if (arg1 !== channel) {
    return channel
  }
}
