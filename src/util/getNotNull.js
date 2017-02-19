/**
 * Created by 方剑成 on 2017/2/18.
 */

export default (...values) => {
  let value = null;
  let len = values.length - 1;
  for (let i = 0; i < len; i++) {
    value = typeof values[i] === 'function' ? values[i]() : values[i];
    if (value !== null) break;
  }
  value = value === null ? (typeof values[len] === 'function' ? values[len]() : values[len]) : value;
  return value;
};