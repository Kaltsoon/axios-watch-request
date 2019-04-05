import test from 'ava';
import { spy } from 'sinon';
import axios from 'axios';

import createEnhancedAdapter from '../index';

const tick = () =>
  new Promise(resolve => {
    setTimeout(resolve);
  });

const makeSimpleAdapter = data => config =>
  Promise.resolve({
    data: JSON.stringify(data),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  });

test('watchRequest subscription is called correctly when new request is made', async t => {
  const adapter = makeSimpleAdapter({ hello: 'world' });

  const { watchRequest, adapter: enhancedAdapter } = createEnhancedAdapter({
    adapter,
  });

  const client = axios.create({
    adapter: enhancedAdapter,
  });

  const subscription = spy();

  watchRequest({
    method: 'get',
    url: '/users/me',
  }).subscribe(subscription);

  client.get('/users/me');

  await tick();

  client.get('/users/john');

  await tick();

  t.is(subscription.callCount, 2);
  t.deepEqual(subscription.getCall(0).args[0], {
    loading: true,
    error: null,
    data: null,
  });
  t.deepEqual(subscription.getCall(1).args[0], {
    loading: false,
    error: null,
    data: { hello: 'world' },
  });
});

test('watchRequest subscription is called with cached data and fresh data', async t => {
  let adapterCalls = 0;

  const adapter = config => {
    adapterCalls++;

    return Promise.resolve({
      data: JSON.stringify({ hello: adapterCalls === 1 ? 'world' : 'john' }),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });
  };

  const { watchRequest, adapter: enhancedAdapter } = createEnhancedAdapter({
    adapter,
  });

  const client = axios.create({
    adapter: enhancedAdapter,
  });

  const subscription = spy();

  client.get('/users/me');

  await tick();

  watchRequest({
    method: 'get',
    url: '/users/me',
  }).subscribe(subscription);

  client.get('/users/me');

  await tick();

  client.get('/users/john');

  await tick();

  t.is(subscription.callCount, 2);
  t.deepEqual(subscription.getCall(0).args[0], {
    loading: true,
    data: { hello: 'world' },
    error: null,
  });
  t.deepEqual(subscription.getCall(1).args[0], {
    loading: false,
    data: { hello: 'john' },
    error: null,
  });
});

test('When cache is disabled, no cached data is published', async t => {
  let adapterCalls = 0;

  const adapter = config => {
    adapterCalls++;

    return Promise.resolve({
      data: JSON.stringify({ hello: adapterCalls === 1 ? 'world' : 'john' }),
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {},
    });
  };

  const { watchRequest, adapter: enhancedAdapter } = createEnhancedAdapter({
    adapter,
    cache: null,
  });

  const client = axios.create({
    adapter: enhancedAdapter,
  });

  const subscription = spy();

  client.get('/users/me');

  await tick();

  watchRequest({
    method: 'get',
    url: '/users/me',
  }).subscribe(subscription);

  client.get('/users/me');

  await tick();

  t.is(subscription.callCount, 2);
  t.deepEqual(subscription.getCall(0).args[0], {
    loading: true,
    data: null,
    error: null,
  });
  t.deepEqual(subscription.getCall(1).args[0], {
    loading: false,
    data: { hello: 'john' },
    error: null,
  });
});
