/**
 * Created by 方剑成 on 2017/2/20.
 */

export default obj => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};