# axios-watch-request :eyes:

[Axios](https://github.com/axios/axios) adapter enhancer for observing request responses. **Requires an `Observable` implementation suitable for [any-observable](https://github.com/sindresorhus/any-observable)**.

[![Build Status](https://travis-ci.org/Kaltsoon/axios-watch-request.svg?branch=master)](https://travis-ci.org/Kaltsoon/axios-watch-request) [![npm version](https://badge.fury.io/js/axios-watch-request.svg)](https://badge.fury.io/js/axios-watch-request)

## Install

```
yarn add axios-watch-request
```

```
npm install axios-watch-request
```

## How does it work?

First, define your own axios adapter, or use the default adapter, `axios.defaults.adapter`. Then pass your adapter to the `createEnhancedAdapter` function:

```javascript
import Observable from 'zen-observable'; // You can also use any Observable implementation suitable for any-observable
import createEnhancedAdapter from 'axios-watch-request';
import axios from 'axios';

const adapter = axios.defaults.adapter;

const { adapter: enhancedAdapter, watchRequest } = createEnhancedAdapter({
  adapter,
});

const client = axios.create({
  adapter: enhancedAdapter,
});
```

Now, you are ready watch any request by calling `watchRequest`, with your request's axios `config` object:

```javascript
const observable = watchRequest({
  method: 'get',
  url: '/users/me',
});

observable.subscribe(({ loading, data, error }) => {
  // ...
});

client.get('/users/me')
  .then(() => {
    // The first result of this request will come directly from the cache, and the actual result when the response arrives
    client.get('/users/me');
  }};
```

The library utilizes simple cache and it operates by "cache and network" policy. This means, that when request's response is in the cache, it is passed to the observable. After that, the actual request is made, and eventually its response is cached and passed to the observable. You can disable the cache by calling `createEnhancedAdapter` with `cache` option as `null`.

## Why do I need it?

In the client applications, it is quite natural to subscribe to a certain data source and observe its changes. On top of that, it is convenient to able refetch data anywhere in the application, and pass the fresh data to everyone interested in it.

## API

### `ConfigSerializer: (AxiosRequestConfig) => string`

Function for serializing request config. Used by the default cache implementation and the adapter enhancer.

### `Cache: { set: (AxiosRequestConfig, any) => void, get: (AxiosRequestConfig) => any }`

Cache implementation for `createEnhancedAdapter`.

### `createEnhancedAdapter({ adapter: AxiosAdapter, cache?: Cache, serializeConfig?: ConfigSerializer }): { adapter: AxiosAdapter, watchRequest: (AxiosRequestConfig) => Observable }`

`createcreateEnhancedAdapter` return an enhanced axios adapter, `adapter` and `watchRequest` function, which allows to subscribe to a request config. Setting `cache` option as `null` disables caching.

## Tests

Run `yarn test`
