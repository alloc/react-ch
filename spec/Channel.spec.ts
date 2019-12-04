import is from '@alloc/is'
import { Channel } from '../src/Channel'

const getCalls = (channel: Channel) =>
  Array.from(
    channel['effects'] as Set<jest.Mock>,
    effect => effect.mock && effect.mock.calls
  ).filter(Boolean)

describe('Channel', () => {
  it('can pass many values to listeners', () => {
    const test = new Channel<[number, number]>()
    test.on(jest.fn())
    test.on(jest.fn())
    test(1, 2)
    test(3, 4)
    expect(getCalls(test)).toMatchSnapshot()
  })

  it('can pass nothing to listeners', () => {
    const test = new Channel<void>()
    test.on(jest.fn())
    test.on(jest.fn())
    test()
    test()
    expect(getCalls(test)).toMatchSnapshot()
  })

  it('can remove a listener during emit', () => {
    const test = new Channel()
    const sub = test.on(() => sub.dispose())
    test.on(jest.fn())
    test()
    expect(getCalls(test)).toMatchSnapshot()
  })

  describe('when no listeners exist', () => {
    it('resolves with an empty array', async () => {
      const test = new Channel()
      const promise = test()
      expect(is(promise)).toBe('Promise')
      expect(await promise).toEqual([])
    })
  })

  describe('when a listener is added with .once()', () => {
    it('only calls the listener once', () => {
      const test = new Channel()
      test.once(jest.fn())
      expect(getCalls(test)).toMatchSnapshot()
    })
  })
})
