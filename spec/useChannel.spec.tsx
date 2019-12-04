import { render } from '@testing-library/react'
import React from 'react'
import { Channel, ChannelEffect, useChannel } from '../src'

describe('useChannel', () => {
  describe('when the 1st arg is a string', () => {
    it('returns a new channel (even for duplicate names)', () => {
      const res: Channel[] = []
      const Test = () => {
        res.push(useChannel('test'), useChannel('test'))
        return null
      }
      render(<Test />)
      expect(res[0]).not.toBe(res[1])
      expect(res[0]).toBeInstanceOf(Channel)
      expect(res[1]).toBeInstanceOf(Channel)
    })

    it('returns a new channel (even for duplicate names)', () => {
      const res: Channel[] = []
      const Test = () => {
        res.push(useChannel('test'), useChannel('test'))
        return null
      }
      render(<Test />)
      expect(res[0]).not.toBe(res[1])
      expect(res[0]).toBeInstanceOf(Channel)
      expect(res[1]).toBeInstanceOf(Channel)
    })

    it('returns the same channel on re-renders', () => {
      let res: Channel[] = []
      const Test = () => {
        res.push(useChannel('test'))
        return null
      }
      const elem = render(<Test />)
      elem.rerender(<Test />)
      expect(res[0]).toBe(res[1])
    })

    it('ignores the 1st arg on re-renders', () => {
      let channel!: Channel
      const Test = ({ name }: { name?: string }) => {
        channel = useChannel(name)
        return null
      }

      const elem = render(<Test name="1" />)
      expect(channel.name).toBe('1')

      elem.rerender(<Test name="2" />)
      expect(channel.name).toBe('1')

      elem.rerender(<Test />)
      expect(channel.name).toBe('1')
    })

    describe('when the 2nd arg is an effect', () => {
      it('only reacts after the 1st commit', () => {
        let channel!: Channel
        const effect = jest.fn()
        const Test = () => {
          channel = useChannel('test', effect)

          channel(1)
          React.useLayoutEffect(() => void channel(2))
          React.useEffect(() => void channel(3))

          return null
        }
        render(<Test />)
        expect(effect.mock.calls).toEqual([[3]])
      })

      it('stops reacting after unmount', () => {
        let channel!: Channel
        const effect = jest.fn()
        const Test = () => {
          channel = useChannel('test', effect)
          return null
        }

        const elem = render(<Test />)
        elem.unmount()

        channel()
        expect(effect).not.toBeCalled()
      })
    })
  })

  describe('when the 1st arg is a channel', () => {
    it('reacts to the channel while mounted', () => {
      const channel = new Channel()
      const effect = jest.fn()
      const Test = () => {
        useChannel(channel, effect)
        return null
      }

      const elem = render(<Test />)
      channel(1)
      channel(2)
      expect(effect.mock.calls).toEqual([[1], [2]])

      effect.mockReset()
      elem.unmount()
      channel(3)
      expect(effect.mock.calls).toEqual([])
    })

    it('replaces the effect on re-render', () => {
      const channel = new Channel()
      const effect1 = jest.fn()
      const effect2 = jest.fn()
      const Test = ({ effect }: { effect: ChannelEffect }) => {
        useChannel(channel, effect)
        return null
      }

      const elem = render(<Test effect={effect1} />)
      channel(1)

      elem.rerender(<Test effect={effect2} />)
      channel(2)

      expect(effect1.mock.calls).toEqual([[1]])
      expect(effect2.mock.calls).toEqual([[2]])
    })

    it('preserves call order when replacing an effect', () => {
      const channel = new Channel()
      const calls: number[] = []

      const Test = ({ effect }: { effect: any }) => {
        useChannel(channel, effect)
        return null
      }

      const elem = render(<Test effect={() => calls.push(1)} />)
      channel.on(() => calls.push(0))
      channel()

      elem.rerender(<Test effect={() => calls.push(2)} />)
      channel()

      expect(calls).toEqual([1, 0, 2, 0])
    })
  })
})
