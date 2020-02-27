import { _, assert } from 'spec.ts'
import { ChannelEffect } from '../src/types'

function fun<T = void>(action: ChannelEffect<T>): typeof action {
  return null as any
}

assert(fun<any>(_), _ as (...args: any[]) => any)
assert(fun<never>(_), _ as (...args: any[]) => any)
assert(fun<void>(_), _ as () => any)
assert(fun<number>(_), _ as (arg1: number) => any)
assert(fun<[number, number]>(_), _ as (arg1: number, arg2: number) => any)
assert(fun<number[]>(_), _ as (...args: number[]) => any)

assert(
  fun(() => {}),
  _ as () => any
)
assert(
  fun((_arg1: number) => {}),
  _ as (arg1: number) => any
)
assert(
  fun((_arg1: number, _arg2: number) => {}),
  _ as (arg1: number, arg2: number) => any
)
assert(
  fun((..._args: number[]) => {}),
  _ as (...args: number[]) => any
)
