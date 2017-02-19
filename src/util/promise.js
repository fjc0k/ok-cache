/**
 * Created by 方剑成 on 2017/2/19.
 */

import Promise from 'promise-polyfill';

if (!window.Promise) {
  window.Promise = Promise;
}