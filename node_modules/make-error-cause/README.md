# Make Error Cause

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Make your own nested error types!

## Features

* Compatible with Node and browsers
* Works with `instanceof`
* Use `error.stack` and `error.name`
* Output full cause with `toString`
* Extends [make-error](https://github.com/julien-f/js-make-error)

## Installation

```sh
npm install make-error-cause --save
```

## Usage

Usages from [`make-error`](https://github.com/julien-f/js-make-error#usage). The only difference is that errors accept a second argument known as the error "cause". The cause is used to wrap original errors with more intuitive feedback - for instance, wrapping a raw database error in a HTTP error.

```js
const CustomError = makeErrorCause('CustomError')

const cause = new Error('boom!')
const error = new CustomError('something bad', cause)

error.toString() //=> "CustomError: something bad\nCaused by: boom!"
error.stack // Works!
error.cause.stack // Handy!
```

## Attribution

Inspired by [`verror`](https://www.npmjs.com/package/verror), and others, but created lighter and without core dependencies for browser usage.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/make-error-cause.svg?style=flat
[npm-url]: https://npmjs.org/package/make-error-cause
[downloads-image]: https://img.shields.io/npm/dm/make-error-cause.svg?style=flat
[downloads-url]: https://npmjs.org/package/make-error-cause
[travis-image]: https://img.shields.io/travis/blakeembrey/make-error-cause.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/make-error-cause
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/make-error-cause.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/make-error-cause?branch=master
