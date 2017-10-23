const isIterable = v => typeof v[Symbol.iterator] === 'function';
const isMap = v => v instanceof Map;

class PromiseMapException {
  constructor(key, reason) {
    this.name = key;
    this.message = reason;
  }
}

// Simple class to denote a Promise which should not resolve to
// any value.  Used to continually push values into the PromiseMap
// that we should wait for completion before returning during resolution.
class DeadPromise {
  constructor(name) {
    this.name = name;
  }
}

const resolveIterable = (key, obj, promises, response) => {
  if (isMap(obj)) {
    // FIXME: Right now this is going to brea with the entries
    //        call since its assuming response is an object.
    response[key] = {};
    resolveMap(obj, promises, response[key]);
  } else {
    promises.push(
      Promise.all(obj).then(r => {
        if (key instanceof DeadPromise) {
          return;
        }
        if (Array.isArray(key)) {
          let i = 0;
          for (const _key of key) {
            response[_key] = r[i];
            i += 1;
          }
        } else {
          response[key] = r;
        }
        return response;
      }),
    );
  }
};

const resolveMap = (map, promises, response) => {
  for (const [key, value] of map) {
    resolveKey(key, value, promises, response);
  }
};

const resolveKey = (key, promise, promises, response) => {
  if (!promise) {
    return;
  }
  if (typeof promise === 'object') {
    if (typeof promise.then === 'function') {
      promises.push(
        Promise.resolve(promise)
          .then(result => {
            if (key instanceof DeadPromise) {
              return;
            }
            if (Array.isArray(response)) {
              response.push([key, result]);
            } else {
              response[key] = result;
            }
            return response;
          })
          .catch(e => {
            throw new PromiseMapException(key, e.message);
          }),
      );
    } else if (isIterable(promise)) {
      resolveIterable(key, promise, promises, response);
    } else {
      response[key] = promise;
    }
  } else {
    response[key] = promise;
  }
};

const resolveDeep = (key, promise, response) => {
  const promises = [];
  resolveKey(key, promise, promises, response);
  return Promise.all(promises);
};

export default class PromiseMap {
  promises = new Map();
  get size() {
    return this.promises.size;
  }
  get length() {
    return this.promises.size;
  }
  forEach = (...args) => this.promises.forEach(...args);
  keys = () => this.promises.keys();
  get = (...keys) => this.resolve(keys);
  set = (key, promise) => {
    if (this.promises.has(key)) {
      throw new Error(`Promise by key ${key} already added, each must be unique`);
    } else {
      this.promises.set(key, promise);
    }
    return this;
  };
  merge = promises => {
    if (!promises || typeof promises !== 'object') {
      throw new Error('PromiseMap merge expects a plain object mapping keys to promises');
    }
    for (const key of Object.keys(promises)) {
      const promise = promises[key];
      this.set(key, promise);
    }
    return this;
  };
  // adds promises which will be resolved but will not be added to the resulting
  // response once resolved.  Any keys which are instances of DeadPromise will
  // not be added to the final results.
  push = (...promises) => {
    for (const promise of promises) {
      this.set(new DeadPromise(), promise);
    }
  };
  // delete one or more keys from our list of promises
  delete = (...keys) => {
    const response = [];
    for (const key of keys) {
      response.push(this.promises.delete(key));
    }
    return response;
  };
  /*
    Remove all Promises from the map
  */
  clear = () => this.delete(this.keys());
  /*
    Does the PromiseMap have all of the keys specified as arguments?
  */
  has = (...keys) => keys.every(key => this.promises.has(key));
  /*
    Resolve the given keys, return the results, remove from promises
    if no keys are given, resolve all
  */
  resolve = (keys, response = {}, promises = []) => {
    if (!keys && this.promises.size > 0) {
      keys = [...this.promises.keys()];
    }
    if (!Array.isArray(keys) && keys) {
      keys = [keys];
    } else if (!keys) {
      // no keys to resolve, resolve response
      return Promise.resolve(response);
    }
    for (const key of keys) {
      const promise = this.promises.get(key);
      this.promises.delete(key);
      if (promise) {
        promises.push(resolveDeep(key, promise, response));
      }
    }
    return Promise.all(promises).then(
      () => (this.promises.size > 0 ? this.resolve(undefined, response) : response),
    );
  };

  /*
    Resolve the given keys (or all if no keys are given), then return them
    as an [entries] object ([ [ key, promise ], [ key2, promise2 ], ... ])
  */
  entries = (...keys) => this.resolve(keys, []);

  [Symbol.iterator] = function* iteratePromise() {
    for (const [key] of this.promises) {
      yield this.resolve(key);
    }
  };

  then = (resolve, reject) =>
    this.resolve()
      .then(resolve)
      .catch(reject);

  catch = reject =>
    this.resolve()
      .then()
      .catch(reject);
}
