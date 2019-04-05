import EventEmitter from 'tiny-emitter';

import { makeCache, makeWatchRequest, isFunction } from './utils';

export default ({ adapter, cache: cacheArg, serializeConfig } = {}) => {
  if (!isFunction(adapter)) {
    throw new Error('Adapter function is required');
  }

  const cache = cacheArg || makeCache({ serializeConfig });

  const eventEmitter = new EventEmitter();

  const enhancedAdapter = config => {
    const cacheValue = cache ? cache.get(config) : undefined;

    eventEmitter.emit('data', {
      config,
      payload: {
        loading: true,
        data: cacheValue !== undefined ? cacheValue : null,
        error: null,
      },
    });

    return adapter(config)
      .then(response => {
        const parsedData = JSON.parse(response.data);

        eventEmitter.emit('data', {
          config,
          payload: {
            loading: false,
            data: parsedData,
            error: null,
          },
        });

        cache && cache.set(config, parsedData);

        return response;
      })
      .catch(response => {
        const parsedData = JSON.parse(response.data);

        eventEmitter.emit('data', {
          config,
          payload: {
            loading: false,
            data: cacheValue !== undefined ? cacheValue : null,
            error: parsedData,
          },
        });

        throw response;
      });
  };

  return {
    adapter: enhancedAdapter,
    watchRequest: makeWatchRequest({ eventEmitter, serializeConfig }),
  };
};
