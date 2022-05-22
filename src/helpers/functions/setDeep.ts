/**
 * Dynamically sets a deeply nested value in an object.
 * It "bores" a path to it if its undefined.
 * @param {!object} obj  - The object which contains the value you want to change/set.
 * @param {!array} path  - The array representation of path to the value you want to change/set.
 * @param {!mixed} value - The value you want to set it to.
 */

export default function setDeep(obj, path: any[], value) {
  path.reduce((prev, curr, index) => {
    if (typeof prev[curr] === 'undefined' && index !== path.length) {
      prev[curr] = {};
      return prev[curr];
    }

    if (index === path.length) {
      prev[curr] = value;
      return value;
    }
    return prev[curr];
  }, obj);
}
