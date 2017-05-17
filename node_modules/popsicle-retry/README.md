# Popsicle Retry

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Enable request retries for Popsicle (>= 3.2).

## Installation

```sh
npm install popsicle-retry --save
```

## Usage

```js
var request = require('popsicle').request
var retry = require('popsicle-retry')

request('http://example.com')
  .use(retry())
  .then(...)
```

### Options

Accepts a function that returns a number of milliseconds to back off for, or `-1`. Defaults to `popsicleRetry.retries(5, retryAllowed)`.

### Methods

* **retryAllowed(request)** Check if a request should be attempted again. Defaults to `5xx` and unavailable errors.
* **retries(count, isRetryAllowed)** An exponential backoff function, defaulting to 5 retries.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/popsicle-retry.svg?style=flat
[npm-url]: https://npmjs.org/package/popsicle-retry
[downloads-image]: https://img.shields.io/npm/dm/popsicle-retry.svg?style=flat
[downloads-url]: https://npmjs.org/package/popsicle-retry
[travis-image]: https://img.shields.io/travis/blakeembrey/popsicle-retry.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/popsicle-retry
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/popsicle-retry.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/popsicle-retry?branch=master
