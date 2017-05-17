'use strict'
var isNumber = require('lodash.isfinite')

/**
 * @id isNumberLike
 * @function isNumberLike
 * Checks whether provided parameter looks like a number
 * @param {any} val - the value to check
 * @returns {boolean} looksLikeNumber - `true` if `val` looks like a number, `false` otherwise
 */
module.exports = function isNumberLike (val) {
  // fail
  if (val === null || val === void 0 || val === false) {
    return false
  }
  if (typeof val === 'function' || val instanceof Array) {
    return false
  }
  var length = val.length
  if (!length) {
    return isNumber(val)
  }
  var i = 0
  // charAt is faster in v8
  if (val.charAt(0) === '-') {
    if (length === 1) {
      // fail do it
      return false
    }
    i = 1
  }
  var foundE = false
  var foundPeriod = false
  for (; i < length; i++) {
    var c = val.charAt(i)
    // bit range is outside number range
    if ((c <= '/' || c >= ':')) {
      if (c === 'e') {
        if (foundE) {
          return false
        }
        foundE = true
      } else if (c === '.') {
        if (foundPeriod) {
          return false
        }
        foundPeriod = true
      } else {
        return false
      }
    }
  }
  return true
}
