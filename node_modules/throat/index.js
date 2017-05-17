'use strict'

module.exports = function (PromiseArgument) {
  var Promise;
  function throat(size, fn) {
    var queue = []
    function run(fn, self, args) {
      if (size) {
        size--
        var result = new Promise(function (resolve) {
          resolve(fn.apply(self, args))
        })
        result.then(release, release)
        return result
      } else {
        return new Promise(function (resolve) {
          queue.push(new Delayed(resolve, fn, self, args))
        })
      }
    }
    function release() {
      size++
      if (queue.length) {
        var next = queue.shift()
        next.resolve(run(next.fn, next.self, next.args))
      }
    }
    if (typeof size === 'function' && typeof fn === 'number') {
      var temp = fn;
      fn = size;
      size = temp;
    }
    if (typeof fn === 'function') {
      return function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        return run(fn, this, args)
      }
    } else {
      return function (fn) {
        var args = [];
        for (var i = 1; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        return run(fn, this, args)
      }
    }
  }
  if (typeof arguments[0] === 'number' || typeof arguments[1] === 'number') {
    Promise = module.exports.Promise;
    if (typeof Promise !== 'function') {
      throw new Error('You must provide a Promise polyfill for this library to work in older environments');
    }
    return throat(arguments[0], arguments[1]);
  } else {
    Promise = PromiseArgument;
    return throat;
  }
}

/* istanbul ignore next */
if (typeof Promise === 'function') {
  module.exports.Promise = Promise;
}

function Delayed(resolve, fn, self, args) {
  this.resolve = resolve
  this.fn = fn
  this.self = self || null
  this.args = args
}
