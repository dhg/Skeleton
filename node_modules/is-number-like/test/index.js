'use strict'
const test = require('tape')
const isNumberLike = require('..')

const testCases = [
// ['number', expectedResult]
  [0, true],
  ['0', true],
  [1.1, true],
  ['1.1', true],
  [-1.1, true],
  ['-1.1', true],
  ['1.1.1', false],
  [1.1e2, true],
  ['1.1e2', true],
  ['1e2e3', false],
  ['-', false],
  [null, false],
  ['22221.2.e.34442', false],
  [ '111a111', false ],
  [[], false],
  [[''], false],
  [Number.EPSILON, true],
  [Number.MAX_SAFE_INTEGER, true],
  [Number.MAX_VALUE, true],
  [Number.MIN_SAFE_INTEGER, true],
  [Number.MIN_VALUE, true],
  [Number.NaN, false],
  [Number.NEGATIVE_INFINITY, false],
  [Number.POSITIVE_INFINITY, false],
  [function (arg1, arg2) {}, false]
]

test('isNumberLike', function (t) {
  t.plan(testCases.length)
  testCases.forEach(function (item) {
    t.equals(isNumberLike(item[0]), item[1], 'isNumberLike(' + JSON.stringify(item[0]) + ') === ' + item[1])
  })
})
