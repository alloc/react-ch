import { is } from '@alloc/is'
import { flushMicroTasks } from 'flush-microtasks'
import { describe, expect, it, Mock, vi } from 'vitest'
import { Channel } from '../src/Channel'

const getCalls = (channel: Channel<any>) =>
  Array.from(
    channel['effects'] as Set<Mock>,
    effect => effect.mock && effect.mock.calls
  ).filter(Boolean)

describe('Channel', () => {
  it('can pass variable arguments to effect functions', () => {
    const test = new Channel<[number, number]>()
    test.on(vi.fn())
    test.on(vi.fn())
    test(1, 2)
    test(3, 4)
    expect(getCalls(test)).toMatchSnapshot()
  })

  it('can pass nothing to effect functions', () => {
    const test = new Channel<void>()
    test.on(vi.fn())
    test.on(vi.fn())
    test()
    test()
    expect(getCalls(test)).toMatchSnapshot()
  })

  it('can remove an effect during emit', () => {
    const test = new Channel()
    const sub = test.on(() => sub.dispose())
    test.on(vi.fn())
    test()
    expect(getCalls(test)).toMatchSnapshot()
  })

  describe('when no effects exist', () => {
    it('resolves with an empty array', async () => {
      const test = new Channel()
      const promise = test()
      expect(is.promise(promise)).toBeTruthy()
      expect(await promise).toEqual([])
    })
  })

  describe('when an effect is added with .once()', () => {
    it('only calls the effect once', () => {
      const test = new Channel()
      test.once(vi.fn())
      expect(getCalls(test)).toMatchSnapshot()
    })
  })

  describe('when effects return promises', () => {
    it('wraps those promises with Promise.all', async () => {
      const test = new Channel<void, number>()
      const promises: { resolve(): void }[] = []
      const createPromise = <T>(value: T) =>
        new Promise<T>(resolve =>
          promises.push({
            resolve: () => resolve(value),
          })
        )

      test.on(() => createPromise(1))
      test.on(() => createPromise(2))

      let result: any[] | undefined
      test().then(value => {
        result = value
      })

      await flushMicroTasks()
      expect(result).toBeUndefined()

      promises.forEach(p => p.resolve())

      await flushMicroTasks()
      expect(result).toEqual([1, 2])
    })
  })
})
