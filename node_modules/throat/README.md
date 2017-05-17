# throat

Throttle the parallelism of an asynchronous, promise returning, function / functions.  This has special utility when you set the concurrency to `1`.  That way you get a mutually exclusive lock.

[![Build Status](https://img.shields.io/travis/ForbesLindesay/throat/master.svg)](https://travis-ci.org/ForbesLindesay/throat)
[![Coverage Status](https://img.shields.io/coveralls/ForbesLindesay/throat/master.svg?style=flat)](https://coveralls.io/r/ForbesLindesay/throat?branch=master)
[![Dependency Status](https://img.shields.io/gemnasium/ForbesLindesay/throat.svg)](https://gemnasium.com/ForbesLindesay/throat)
[![NPM version](https://img.shields.io/npm/v/throat.svg)](http://badge.fury.io/js/throat)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/throat.svg)](https://saucelabs.com/u/throat)

## Installation

    npm install throat

## API

### throat(concurrency)

This returns a function that acts a bit like a lock (exactly as a lock if concurrency is 1).

Example, only 2 of the following functions will execute at any one time:

```js
// with polyfill or in iojs
require('promise/polyfill')
var throat = require('throat')(2)
// alternatively provide your own promise implementation
var throat = require('throat')(require('promise'))(2)

var resA = throat(function () {
  //async stuff
  return promise
})
var resA = throat(function () {
  //async stuff
  return promise
})
var resA = throat(function () {
  //async stuff
  return promise
})
var resA = throat(function () {
  //async stuff
  return promise
})
var resA = throat(function () {
  //async stuff
  return promise
})
```

### throat(concurrency, worker)

This returns a function that is an exact copy of `worker` except that it will only execute up to `concurrency` times in parallel before further requests are queued:

```js
// with polyfill or in iojs
require('promise/polyfill')
var throat = require('throat')
// alternatively provide your own promise implementation
var throat = require('throat')(require('promise'))

var input = ['fileA.txt', 'fileB.txt', 'fileC.txt', 'fileD.txt']
var data = Promise.all(input.map(throat(2, function (fileName) {
  return readFile(fileName)
})))
```

Only 2 files will be read at a time, sometimes limiting parallelism in this way can improve scalability.

## License

  MIT
