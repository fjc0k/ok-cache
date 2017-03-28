/**
 * Created by 方剑成 on 2017/3/28.
 */

export default class wxappDriver {

  has(key) {
    return this.get(key) !== null;
  }

  get(key) {
    let value = null;
    try {
      value = JSON.parse(wx.getStorageSync(key));
    } catch (err) {}
    return value;
  }

  keys() {
    return wx.getStorageInfoSync().keys;
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
    wx.setStorageSync(key, JSON.stringify(value));
    return value;
  }

  remove(key) {
    return wx.removeStorageSync(key);
  }

  count() {
    return this.keys().length;
  }

  clear() {
    return wx.clearStorageSync();
  }

}