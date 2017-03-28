/*!
 * ok-cache v1.0.3 
 * (c) 2017 fjc0k
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.OkCache = factory());
}(this, (function () { 'use strict';

/**
 * Created by 方剑成 on 2017/2/18.
 */

var assertOk = function (value, message) {
  if (!value) {
    throw new Error(message || 'Expected true, got' + value);
  }
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var getNotNull = function () {
  var values = [], len$1 = arguments.length;
  while ( len$1-- ) values[ len$1 ] = arguments[ len$1 ];

  var value = null;
  var len = values.length - 1;
  for (var i = 0; i < len; i++) {
    value = typeof values[i] === 'function' ? values[i]() : values[i];
    if (value !== null) { break; }
  }
  value = value === null ? (typeof values[len] === 'function' ? values[len]() : values[len]) : value;
  return value;
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var forOwn = function (obj, func) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      func(obj[key], key);
    }
  }
};

/**
 * Created by 方剑成 on 2017/2/20.
 */

var isPromise = function (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

/**
 * Created by 方剑成 on 2017/2/18.
 */

var sessionDriver = function sessionDriver() {
  this.data = {};
};

sessionDriver.prototype.has = function has (key) {
  return key in this.data;
};

sessionDriver.prototype.get = function get (key) {
  return this.has(key) ? (this.data[key] === undefined ? null : this.data[key]) : null;
};

sessionDriver.prototype.keys = function keys () {
  return Object.keys(this.data);
};

sessionDriver.prototype.all = function all () {
  return this.data;
};

sessionDriver.prototype.set = function set (key, value) {
  return this.data[key] = value;
};

sessionDriver.prototype.remove = function remove (key) {
  return delete this.data[key];
};

sessionDriver.prototype.count = function count () {
  return Object.keys(this.data).length;
};

sessionDriver.prototype.clear = function clear () {
  this.data = {};
  return true;
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var storageDriver = function storageDriver(type) {
  if ( type === void 0 ) type = 'local';

  assertOk(
    ['local', 'session'].indexOf(type) !== -1,
    'Storage type must be local or session'
  );

  this.storage = window[type + 'Storage'];

};

storageDriver.prototype.has = function has (key) {
  return this.storage.getItem(key) !== null;
};

storageDriver.prototype.get = function get (key) {
  var value = null;
  try {
    value = JSON.parse(this.storage.getItem(key));
  } catch (err) {}
  return value;
};

storageDriver.prototype.keys = function keys () {
    var this$1 = this;

  var keys = [];
  var count = this.count();
  for (var i = 0; i < count; i++) {
    keys.push(this$1.storage.key(i));
  }
  return keys;
};

storageDriver.prototype.all = function all () {
    var this$1 = this;

  var all = {};
  var keys = this.keys();
  for (var i = 0; i < keys.length; i++) {
    all[keys[i]] = this$1.get(keys[i]);
  }
  return all;
};

storageDriver.prototype.set = function set (key, value) {
  this.storage.setItem(key, JSON.stringify(value));
  return value;
};

storageDriver.prototype.remove = function remove (key) {
  return this.storage.removeItem(key);
};

storageDriver.prototype.count = function count () {
  return this.storage.length;
};

storageDriver.prototype.clear = function clear () {
  return this.storage.clear();
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var sessionStorageDriver = (function (storageDriver$$1) {
  function sessionStorageDriver() {
    storageDriver$$1.call(this, 'session');
  }

  if ( storageDriver$$1 ) sessionStorageDriver.__proto__ = storageDriver$$1;
  sessionStorageDriver.prototype = Object.create( storageDriver$$1 && storageDriver$$1.prototype );
  sessionStorageDriver.prototype.constructor = sessionStorageDriver;

  return sessionStorageDriver;
}(storageDriver));

/**
 * Created by 方剑成 on 2017/2/18.
 */

var localStorageDriver = (function (storageDriver$$1) {
  function localStorageDriver() {
    storageDriver$$1.call(this, 'local');
  }

  if ( storageDriver$$1 ) localStorageDriver.__proto__ = storageDriver$$1;
  localStorageDriver.prototype = Object.create( storageDriver$$1 && storageDriver$$1.prototype );
  localStorageDriver.prototype.constructor = localStorageDriver;

  return localStorageDriver;
}(storageDriver));

/**
 * Created by 方剑成 on 2017/3/28.
 */

var wxappDriver = function wxappDriver () {};

wxappDriver.prototype.has = function has (key) {
  return this.get(key) !== null;
};

wxappDriver.prototype.get = function get (key) {
  var value = null;
  try {
    value = JSON.parse(wx.getStorageSync(key));
  } catch (err) {}
  return value;
};

wxappDriver.prototype.keys = function keys () {
  return wx.getStorageInfoSync().keys;
};

wxappDriver.prototype.all = function all () {
    var this$1 = this;

  var all = {};
  var keys = this.keys();
  for (var i = 0; i < keys.length; i++) {
    all[keys[i]] = this$1.get(keys[i]);
  }
  return all;
};

wxappDriver.prototype.set = function set (key, value) {
  wx.setStorageSync(key, JSON.stringify(value));
  return value;
};

wxappDriver.prototype.remove = function remove (key) {
  return wx.removeStorageSync(key);
};

wxappDriver.prototype.count = function count () {
  return this.keys().length;
};

wxappDriver.prototype.clear = function clear () {
  return wx.clearStorageSync();
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var drivers = {
  session: sessionDriver,
  sessionStorage: sessionStorageDriver,
  localStorage: localStorageDriver,
  wxapp: wxappDriver
};

/**
 * Created by 方剑成 on 2017/2/18.
 */

var OkCache = function OkCache(ref) {
  var prefix = ref.prefix; if ( prefix === void 0 ) prefix = '';
  var driver = ref.driver; if ( driver === void 0 ) driver = 'localStorage';
  var promise = ref.promise; if ( promise === void 0 ) promise = null;

  assertOk(drivers[driver], ("The " + driver + " driver is not found"));
  assertOk(
    promise !== null || window.Promise !== undefined,
    "Promise is required"
  );

  this.prefix = prefix;

  this.driver = driver;
  this.cache = new (drivers[driver])();
  this.$cache = new (drivers.session)(); // 二级缓存

  // Promise 适配
  this.promise = promise === null ? window.Promise : promise;

};

OkCache.prototype.$key = function $key (key) {
  return this.prefix + key;
};

OkCache.prototype.$value = function $value (value, resolve, reject) {
    if ( resolve === void 0 ) resolve = null;
    if ( reject === void 0 ) reject = null;

  if (reject === null) {
    return typeof value === 'function' ? value() : value;
  } else {
    return typeof value === 'function' ? value(resolve, reject) : resolve(value);
  }
};

OkCache.prototype.$shouldAsync = function $shouldAsync (value) {
  return typeof value === 'function' && value.length > 0;
};

OkCache.prototype.$wrapper = function $wrapper (func, isAsync) {
    var this$1 = this;

  if (isAsync) {
    return (function (func) {
      return new this$1.promise(function (resolve, reject) {
        return (
          func(function (value, checkNull) {
              if ( checkNull === void 0 ) checkNull = false;

            if (checkNull) { value !== null && resolve(value); }
            else { resolve(value); }
            return value;
          }, reject)
        );
      });
    })(func);
  } else {
    return func(function (value) { return value; }, null);
  }
};

OkCache.prototype.get = function get (key, defaultValue, no$cache, forceAsync) {
    var this$1 = this;
    if ( defaultValue === void 0 ) defaultValue = null;
    if ( no$cache === void 0 ) no$cache = false;
    if ( forceAsync === void 0 ) forceAsync = false;


  var isAsync = forceAsync || this.$shouldAsync(defaultValue);

  return this.$wrapper(function (resolve, reject) {
    var fullKey = this$1.$key(key);

    return getNotNull(
      // 二级缓存
      function () { return resolve((no$cache ? null : this$1.$cache.get(fullKey)), true); },
      // 一级缓存
      function () {
        var value = this$1.cache.get(fullKey);
        if (!no$cache && value !== null) { this$1.$cache.set(fullKey, value); }
        return resolve(value, true);
      },
      // 默认值
      function () { return this$1.$value(defaultValue, resolve, reject); }
    );
  }, isAsync);

};

OkCache.prototype.getMany = function getMany (keysOrKeysToDefaultValues, no$cache) {
    var this$1 = this;
    if ( no$cache === void 0 ) no$cache = false;

  if (Array.isArray(keysOrKeysToDefaultValues)) {
    var keys = keysOrKeysToDefaultValues;
    var KeysToValues = {};
    keys.forEach(
      function (key) { return KeysToValues[key] = this$1.get(key, null, no$cache); }
    );
    return KeysToValues;
  } else {
    var KDs = keysOrKeysToDefaultValues;
    var isAsync = false;
    var keys$1 = Object.keys(KDs);
    var len = keys$1.length;
    for(var i = 0; i < len; i++){
      var key = keys$1[i];
      if (this$1.$shouldAsync(KDs[key])) {
        isAsync = true;
        break;
      }
    }
    if (isAsync) {

      return new this.promise(function (resolve, reject) {
        var valuesPromises = keys$1.map(
          function (key) { return this$1.get(key, KDs[key], no$cache, true); }
        );
        this$1.promise.all(valuesPromises).then(function (values) {
          var KeysToValues = {};
          keys$1.forEach(function (key, index) {
            KeysToValues[key] = values[index];
          });
          resolve(KeysToValues);
        }, function (err) { return reject(err); });
      });
    }

  }

};


OkCache.prototype.keys = function keys () {
    var this$1 = this;

  return this.cache.keys().filter(
    function (key) { return key.substr(0, this$1.prefix.length) === this$1.prefix; }
  ).map(
    function (key) { return key.substr(this$1.prefix.length); }
  );
};

OkCache.prototype.all = function all () {
  return this.getMany(this.keys());
};

OkCache.prototype.put = function put (key, value) {
    var this$1 = this;

  key = this.$key(key);
  value = this.$value(value, key);
  value = value === undefined ? null : value;
  ['$cache', 'cache'].forEach(
    function (cache) { return this$1[cache].set(key, value); }
  );
  return true;
};

OkCache.prototype.putMany = function putMany (values) {
    var this$1 = this;

  forOwn(
    values,
    function (value, key) { return this$1.put(key, value); }
  );
  return true;
};

OkCache.prototype.switch = function switch$1 (key, newValue) {
    if ( newValue === void 0 ) newValue = null;

  newValue = typeof newValue === 'boolean' ? newValue : !this.get(key, false);
  this.put(key, newValue);
  return newValue;
};

OkCache.prototype.increment = function increment (key, amount, maxValue) {
    if ( amount === void 0 ) amount = 1;
    if ( maxValue === void 0 ) maxValue = Infinity;

  var newValue = +this.get(key, 0) + amount;
  this.put(key, Math.min(newValue, maxValue));
  return newValue;
};

OkCache.prototype.decrement = function decrement (key, amount, minValue) {
    if ( amount === void 0 ) amount = 1;
    if ( minValue === void 0 ) minValue = -Infinity;

  var newValue = +this.get(key, 0) - amount;
  this.put(key, Math.max(newValue, minValue));
  return newValue;
};

OkCache.prototype.remember = function remember (key, defaultValue, no$cache) {
    var this$1 = this;
    if ( no$cache === void 0 ) no$cache = false;

  if (this.$shouldAsync(defaultValue)) {
    return new this.promise(function (resolve, reject) {
      this$1.get(key, defaultValue, no$cache, true).then(function (value) {
        this$1.put(key, value);
        resolve(value);
      }, function (err) { return reject(err); });
    });
  } else {
    var value = this.get(key, defaultValue, no$cache);
    this.put(key, value);
    return value;
  }
};

OkCache.prototype.rememberMany = function rememberMany (keysOrKeysToDefaultValues, no$cache) {
    var this$1 = this;
    if ( no$cache === void 0 ) no$cache = false;

  var keysToValues = this.getMany(keysOrKeysToDefaultValues, no$cache);
  if (isPromise(keysToValues)) { // is a Promise
    return new this.promise(function (resolve, reject) {
      keysToValues.then(function (keysToValues) {
        forOwn(keysToValues, function (value, key) {
          this$1.put(key, value);
        });
        resolve(keysToValues);
      }, function (err) { return reject(err); });
    });
  } else {
    forOwn(keysToValues, function (value, key) {
      this$1.put(key, value);
    });
    return keysToValues;
  }
};

OkCache.prototype.forget = function forget (keyOrKeys) {
    var this$1 = this;

  var keys = Array.isArray(keyOrKeys) ? keyOrKeys : [ keyOrKeys ];
  keys.forEach(function (key) {
    key = this$1.$key(key);
    ['$cache', 'cache'].forEach(
      function (cache) { return this$1[cache].remove(key); }
    );
  });
  return true;
};

OkCache.prototype.flush = function flush () {
  this.forget(this.keys());
  return this;
};


OkCache.prototype.getPrefix = function getPrefix () {
  return this.prefix;
};

OkCache.prototype.setPrefix = function setPrefix (prefix) {
  this.prefix = prefix;
};

OkCache.prototype.getDriver = function getDriver () {
  return this.driver;
};

OkCache.prototype.setDriver = function setDriver (driver) {
  this.driver = driver;
};

return OkCache;

})));
