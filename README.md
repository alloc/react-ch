# react-ch

The `Channel` class is used to achieve loose coupling between an event source and its subscribers. To notify subscribers, it must be called as a function.

The `useChannel` hook has two different use cases.

- as a shortcut for `useConstant(() => new Channel(name))`

- for subscribing to a channel

```ts
const didLogin = useChannel<User>()

// Listen for "didLogin" events while mounted.
useChannel(didLogin, (user: User) => {...})

// Send an event to subscribers.
didLogin(user)
```

### Async decentralized work

Channels can be used to depend on arbitrary work performed by subscribers. Every event has a promise that resolves with an array of return values (from subscribers).

```ts
// Use a channel to orchestrate animations.
const willAppear = useChannel<[], void>()
await willAppear()

// In a deep descendant:
useChannel(willAppear, () => animate(...))
```
