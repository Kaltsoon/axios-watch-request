import Observable from 'any-observable';

export const isObject = val => toString.call(val) === '[object Object]';

export const serializeObject = val => {
  if (isObject(val)) {
    const keys = Object.keys(val);

    const sortedObject = keys.sort().reduce((acc, curr) => {
      acc[curr] = val[curr];
    }, {});

    return JSON.stringify(sortedObject);
  }

  return '';
};

export const defaultSerializeConfig = config => {
  return `${config.method.toLowerCase()}__${config.url}__${
    config.params ? serializeObject(config.params) : ''
  }`;
};

export const isString = val => typeof val === 'string';

export const isValidConfig = config =>
  isObject(config) && isString(config.method) && isString(config.url);

export const isFunction = val => toString.call(val) === '[object Function]';

export const makeCache = ({ serializeConfig = defaultSerializeConfig }) => {
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

export const makeWatchRequest = ({
  eventEmitter,
  serializeConfig = defaultSerializeConfig,
}) => {
  return config =>
    new Observable(observer => {
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
