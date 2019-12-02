# react-ch

The `Channel` class is used to achieve loose coupling between an event source and its subscribers. To notify subscribers, it must be called as a function.

The `useChannel` hook has two different use cases.

- as a shortcut for `useConstant(() => new Channel(name))`

- for subscribing to a channel

```ts
const didLogin = useChannel<User>('login')
didLogin(user)

// Listen for "login" events while mounted.
useChannel(didLogin, (user: User) => {...})
```
