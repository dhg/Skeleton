/*!
 * arr-flatten <https://github.com/jonschlinkert/arr-flatten>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function flatten(arr) {
  return flat(arr, []);
};

function flat(arr, acc) {
  var len = arr.length;
  var idx = -1;

  while (++idx < len) {
    var cur = arr[idx];
    if (Array.isArray(cur)) {
      flat(cur, acc);
    } else {
      acc.push(cur);
    }
  }
  return acc;
}
