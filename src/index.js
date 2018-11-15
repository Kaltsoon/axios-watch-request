import EventEmitter from 'tiny-emitter';

import { makeCache, makeWatchRequest, isFunction } from './utils';

export default ({ adapter, cache = makeCache() } = {}) => {
  if (!isFunction(adapter)) {
    throw new Error('Adapter function is required');
  }

	const eventEmitter = new EventEmitter();
	
	const enhancedAdapter = config => {
  	const cacheValue = cache ? cache.get(config) : undefined;
  
  	if (cacheValue !== undefined) {
    	eventEmitter.emit('data', {
      	config,
        payload: {
        	loading: false,
          data: cacheValue.data,
          error: null,
        },
      });
    }
    
    eventEmitter.emit('data', {
    	config,
      payload: {
      	loading: true,
        data: null,
        error: null,
      },
    });
    
    return adapter(config)
    	.then(response => {
      	eventEmitter.emit('data', {
        	config,
          payload: {
          	loading: false,
         		data: response.data,
            error: null,
          },
        });
        
        cache && cache.set(config, response.data);
      
      	return response;
      })
      .catch(response => {
      	eventEmitter.emit('data', {
        	config,
          payload: {
          	loading: false,
         		data: null,
            error: response.data,
          },
        });
        
      	throw response;
      });
  };
  
  return {
  	adapter: enhancedAdapter,
    watchRequest: makeWatchRequest(eventEmitter),
  };
};