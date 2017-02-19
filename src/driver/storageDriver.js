/**
 * Created by 方剑成 on 2017/2/18.
 */

import assertOk from '../util/assertOk';

export default class storageDriver {

  constructor(type = 'local') {
    assertOk(
      ['local', 'session'].indexOf(type) !== -1,
      'Storage type must be local or session'
    );

    this.storage = window[type + 'Storage'];

  }

  has(key) {
    return this.storage.getItem(key) !== null;
  }

  get(key) {
    let value = null;
    try {
      value = JSON.parse(this.storage.getItem(key));
    } catch (err) {}
    return value;
  }

  keys() {
    let keys = [];
    let count = this.count();
    for (let i = 0; i < count; i++) {
      keys.push(this.storage.key(i));
    }
    return keys;
  }

  all() {
    let all = {};
    let keys = this.keys();
    for (let i = 0; i < keys.length; i++) {
      all[keys[i]] = this.get(keys[i]);
    }
    return all;
  }

  set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }

  remove(key) {
    return this.storage.removeItem(key);
  }

  count() {
    return this.storage.length;
  }

  clear() {
    return this.storage.clear();
  }

}