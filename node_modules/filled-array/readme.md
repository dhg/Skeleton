# filled-array [![Build Status](https://travis-ci.org/sindresorhus/filled-array.svg?branch=master)](https://travis-ci.org/sindresorhus/filled-array)

> Returns an array filled with the specified input


## Install

```
$ npm install --save filled-array
```


## Usage

```js
const filledArray = require('filled-array');

filledArray('x', 3);
//=> ['x', 'x', 'x']

filledArray(0, 3);
//=> [0, 0, 0]

filledArray(i => {
	return (++i % 3 ? '' : 'Fizz') + (i % 5 ? '' : 'Buzz') || i;
}, 15);
//=> [1, 2, 'Fizz', 4, 'Buzz', 'Fizz', 7, 8, 'Fizz', 'Buzz', 11, 'Fizz', 13, 14, 'FizzBuzz']
```


## API

### filledArray(filler, count)

#### filler

Type: Any

Value to fill the array with.

You can pass a function to generate the array items dynamically. The function is expected to return the value for each iteration and will be called with the following arguments: index, the count you passed in, and the filled array thus far.

#### count

Type: `number`

Number of items to fill the array with.


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
