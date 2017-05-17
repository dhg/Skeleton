# Popsicle Status

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Reject responses on HTTP failure status codes (404, 500, etc).

## Installation

```
npm install popsicle-status --save
```

## Usage

```javascript
var request = require('popsicle')
var status = require('popsicle-status')

request('/users.json')
  .use(status())
  .catch(function (error) {
    console.log(error.type) //=> "EINVALIDSTATUS"
    console.log(error.message) //=> "Invalid HTTP status, 404, should be between 200 and 399"
    console.log(error.status) //=> 404
    console.log(error.popsicle) //=> Popsicle#Request
  })
```

* **status()** Use default status codes (min: `200`, max: `399`)
* **status(number)** Set the only valid HTTP status code
* **status(number, number)** Set both the minimum and maximum HTTP status codes

## TypeScript

Includes a [type definition](popsicle-status.d.ts) for TypeScript.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/popsicle-status.svg?style=flat
[npm-url]: https://npmjs.org/package/popsicle-status
[downloads-image]: https://img.shields.io/npm/dm/popsicle-status.svg?style=flat
[downloads-url]: https://npmjs.org/package/popsicle-status
[travis-image]: https://img.shields.io/travis/blakeembrey/popsicle-status.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/popsicle-status
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/popsicle-status.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/popsicle-status?branch=master
