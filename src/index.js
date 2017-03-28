/**
 * Created by 方剑成 on 2017/2/18.
 */

import { assertOk, forOwn, getNotNull, isPromise } from './util';
import drivers from './driver';

export default class OkCache {

  constructor({
    prefix = '',
    driver = 'localStorage',
    promise = null
  }) {
    assertOk(drivers[driver], `The ${driver} driver is not found`);
    assertOk(
      promise !== null || window.Promise !== undefined,
      `Promise is required`
    );

    this.prefix = prefix;

    this.driver = driver;
    this.cache = new (drivers[driver])();
    this.$cache = new (drivers.session)(); // 二级缓存

    // Promise 适配
    this.promise = promise === null ? window.Promise : promise;

  }

  $key(key) {
    return this.prefix + key;
  }

  $value(value, resolve = null, reject = null) {
    if (reject === null) {
      return typeof value === 'function' ? value() : value;
    } else {
      return typeof value === 'function' ? value(resolve, reject) : resolve(value);
    }
  }

  $shouldAsync(value) {
    return typeof value === 'function' && value.length > 0;
  }

  $wrapper(func, isAsync) {
    if (isAsync) {
      return ((func) => {
        return new this.promise((resolve, reject) => {
          return (
            func((value, checkNull = false) => {
              if (checkNull) value !== null && resolve(value);
              else resolve(value);
              return value;
            }, reject)
          );
        });
      })(func);
    } else {
      return func(value => value, null);
    }
  }

  get(key, defaultValue = null, no$cache = false, forceAsync = false) {

    let isAsync = forceAsync || this.$shouldAsync(defaultValue);

    return this.$wrapper((resolve, reject) => {
      let fullKey = this.$key(key);

      return getNotNull(
        // 二级缓存
        () => resolve((no$cache ? null : this.$cache.get(fullKey)), true),
        // 一级缓存
        () => {
          let value = this.cache.get(fullKey);
          if (!no$cache && value !== null) this.$cache.set(fullKey, value);
          return resolve(value, true);
        },
        // 默认值
        () => this.$value(defaultValue, resolve, reject)
      );
    }, isAsync);

  }

  getMany(keysOrKeysToDefaultValues, no$cache = false) {
    if (Array.isArray(keysOrKeysToDefaultValues)) {
      let keys = keysOrKeysToDefaultValues;
      let KeysToValues = {};
      keys.forEach(
        key => KeysToValues[key] = this.get(key, null, no$cache)
      );
      return KeysToValues;
    } else {
      let KDs = keysOrKeysToDefaultValues;
      let isAsync = false;
      let keys = Object.keys(KDs);
      let len = keys.length;
      for(let i = 0; i < len; i++){
        let key = keys[i];
        if (this.$shouldAsync(KDs[key])) {
          isAsync = true;
          break;
        }
      }
      if (isAsync) {

        return new this.promise((resolve, reject) => {
          let valuesPromises = keys.map(
            key => this.get(key, KDs[key], no$cache, true)
          );
          this.promise.all(valuesPromises).then(values => {
            let KeysToValues = {};
            keys.forEach((key, index) => {
              KeysToValues[key] = values[index];
            });
            resolve(KeysToValues);
          }, err => reject(err));
        });
      }

    }

  }


  keys() {
    return this.cache.keys().filter(
      key => key.substr(0, this.prefix.length) === this.prefix
    ).map(
      key => key.substr(this.prefix.length)
    );
  }

  all() {
    return this.getMany(this.keys());
  }

  put(key, value) {
    key = this.$key(key);
    value = this.$value(value, key);
    value = value === undefined ? null : value;
    ['$cache', 'cache'].forEach(
      cache => this[cache].set(key, value)
    );
    return true;
  }

  putMany(values) {
    forOwn(
      values,
      (value, key) => this.put(key, value)
    );
    return true;
  }

  switch(key, newValue = null) {
    newValue = typeof newValue === 'boolean' ? newValue : !this.get(key, false);
    this.put(key, newValue);
    return newValue;
  }

  increment(key, amount = 1, maxValue = Infinity) {
    let newValue = +this.get(key, 0) + amount;
    this.put(key, Math.min(newValue, maxValue));
    return newValue;
  }

  decrement(key, amount = 1, minValue = -Infinity) {
    let newValue = +this.get(key, 0) - amount;
    this.put(key, Math.max(newValue, minValue));
    return newValue;
  }

  remember(key, defaultValue, no$cache = false) {
    if (this.$shouldAsync(defaultValue)) {
      return new this.promise((resolve, reject) => {
        this.get(key, defaultValue, no$cache, true).then(value => {
          this.put(key, value);
          resolve(value);
        }, err => reject(err));
      });
    } else {
      let value = this.get(key, defaultValue, no$cache);
      this.put(key, value);
      return value;
    }
  }

  rememberMany(keysOrKeysToDefaultValues, no$cache = false) {
    let keysToValues = this.getMany(keysOrKeysToDefaultValues, no$cache);
    if (isPromise(keysToValues)) { // is a Promise
      return new this.promise((resolve, reject) => {
        keysToValues.then(keysToValues => {
          forOwn(keysToValues, (value, key) => {
            this.put(key, value);
          });
          resolve(keysToValues);
        }, err => reject(err));
      });
    } else {
      forOwn(keysToValues, (value, key) => {
        this.put(key, value);
      });
      return keysToValues;
    }
  }

  forget(keyOrKeys) {
    let keys = Array.isArray(keyOrKeys) ? keyOrKeys : [ keyOrKeys ];
    keys.forEach(key => {
      key = this.$key(key);
      ['$cache', 'cache'].forEach(
        cache => this[cache].remove(key)
      );
    });
    return true;
  }

  flush() {
    this.forget(this.keys());
    return this;
  }


  getPrefix() {
    return this.prefix;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
  }

  getDriver() {
    return this.driver;
  }

  setDriver(driver) {
    this.driver = driver;
  }

}