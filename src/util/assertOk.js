/**
 * Created by 方剑成 on 2017/2/18.
 */

export default (value, message) => {
  if (!value) {
    throw new Error(message || 'Expected true, got' + value);
  }
};