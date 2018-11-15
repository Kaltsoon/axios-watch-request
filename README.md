# axios-watch-request

Axios adapter enhancer for turning request progress changes into an observable. **This library is still work in progress, use with caution!**.

## How does it work?

First, define your own axios adapter, or use the default adapter, `axios.defaults.adapter`. Then pass your adapter to the `createEnhancedAdapter` function:

```javascript
import createEnhancedAdapter from 'axios-watch-request';
import axios from 'axios';

const adapter = axios.defaults.adapter;

const { adapter: enhancedAdapter, watchRequest } = createEnhancedAdapter({ adapter });

const client = axios.create({
  adapter: enhancedAdapter
});
```

Now, you are ready watch any request by calling `watchRequest`, with your request's axios `config` object:

```javascript
client.get('/users/me');

const observable = client.watchRequest({
  method: 'get',
  url: '/users/me',
});

observable.subscribe(({ loading, data, error }) => {
  // ...
});
```

The library utilizes simple cache and it operates by "cache and network" policy. This means, that when request's response is in the cache, it is passed to the observable. After that, the actual request is made, and eventually its response is cached and passed to the observable. You can disable the cache by calling `createEnhancedAdapter` with `cache` option as `null`.

## Why do I need it?

In the client applications, it is quite natural to subscribe into a certain data source and observe its changes. On top of that, it is convenient to be able to able refetch data anywhere in the application, and pass the fresh data to everyone interested in it.
