/**
 * Created by 方剑成 on 2017/2/18.
 */

export default class sessionDriver {
  constructor() {
    this.data = {};
  }

  has(key) {
    return key in this.data;
  }

  get(key) {
    return this.has(key) ? (this.data[key] === undefined ? null : this.data[key]) : null;
  }

  keys() {
    return Object.keys(this.data);
  }

  all() {
    return this.data;
  }

  set(key, value) {
    return this.data[key] = value;
  }

  remove(key) {
    return delete this.data[key];
  }

  count() {
    return Object.keys(this.data).length;
  }

  clear() {
    this.data = {};
    return true;
  }

}