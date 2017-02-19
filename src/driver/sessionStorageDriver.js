/**
 * Created by 方剑成 on 2017/2/18.
 */

import storageDriver from './storageDriver';

export default class sessionStorageDriver extends storageDriver {
  constructor() {
    super('session');
  }
}