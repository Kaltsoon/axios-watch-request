import Observable from 'any-observable';

export const serializeConfig = config => {
	return `${config.method.toLowerCase()}__${config.url}`;
};

export const isObject = val => toString.call(val) === '[object Object]';

export const isString = val => typeof val === 'string';

export const isValidConfig = config => isObject(config) && isString(config.method) && isString(config.url);

export const isFunction = val => toString.call(val) === '[object Function]';

export const makeCache = () => {
	const cache = {};

	return {
  	get(config) {
    	return isValidConfig(config) ? cache[serializeConfig(config)] : undefined;
    },
    set(config, value) {
    	if (isValidConfig(config)) {
      	cache[serializeConfig(config)] = value;
      }
    },
  };
};

export const makeWatchRequest = eventEmitter => {
	return config => new Observable(observer => {
  	const callback = data => {
    	if (serializeConfig(data.config) === serializeConfig(config)) {
      	observer.next(data.payload);
      }
    };
  
  	eventEmitter.on('data', callback);
    
    return () => {
    	eventEmitter.off('data', callback);
    };
  });
};