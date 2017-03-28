/**
 * Created by 方剑成 on 2017/2/18.
 */

import sessionDriver from './sessionDriver';
import sessionStorageDriver from './sessionStorageDriver';
import localStorageDriver from './localStorageDriver';
import wxappDriver from './wxappDriver';

export default {
  session: sessionDriver,
  sessionStorage: sessionStorageDriver,
  localStorage: localStorageDriver,
  wxapp: wxappDriver
}