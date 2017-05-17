# <img src="screenshot.png" width="400" alt="boxen">

> Create boxes in the terminal

[![Build Status](https://travis-ci.org/sindresorhus/boxen.svg?branch=master)](https://travis-ci.org/sindresorhus/boxen)


## Install

```
$ npm install --save boxen
```


## Usage

```js
const boxen = require('boxen');

console.log(boxen('unicorn', {padding: 1}));
/*
┌─────────────┐
│             │
│   unicorn   │
│             │
└─────────────┘
*/

console.log(boxen('unicorn', {padding: 1, margin: 1, borderStyle: 'double'}));
/*

   ╔═════════════╗
   ║             ║
   ║   unicorn   ║
   ║             ║
   ╚═════════════╝

*/
```


## API

### boxen(input, [options])

#### input

Type: `string`

Text inside the box.

#### options

##### borderColor

Type: `string`<br>
Values: `black` `red` `green` `yellow` `blue` `magenta` `cyan` `white` `gray`

Color of the box border.

##### borderStyle

Type: `string` `object`<br>
Default: `single`<br>
Values:
- `single`
```
┌───┐
│foo│
└───┘
```
- `double`
```
╔═══╗
║foo║
╚═══╝
```
- `round` (`single` sides with round corners)
```
╭───╮
│foo│
╰───╯
```
- `single-double` (`single` on top and bottom, `double` on right and left)
```
╓───╖
║foo║
╙───╜
```
- `double-single` (`double` on top and bottom, `single` on right and left)
```
╒═══╕
│foo│
╘═══╛
```

Style of the box border.

Can be any of the above predefined styles or an object with the following keys:

```js
{
	topLeft: '+',
	topRight: '+',
	bottomLeft: '+',
	bottomRight: '+',
	horizontal: '-',
	vertical: '|'
}
```


##### padding

Type: `number` `object`<br>
Default: `0`

Space between the text and box border.

Accepts a number or an object with any of the `top`, `right`, `bottom`, `left` properties. When a number is specified, the left/right padding is 3 times the top/bottom to make it look nice.

##### margin

Type: `number` `object`<br>
Default: `0`

Space around the box.

Accepts a number or an object with any of the `top`, `right`, `bottom`, `left` properties. When a number is specified, the left/right margin is 3 times the top/bottom to make it look nice.


## Related

- [boxen-cli](https://github.com/sindresorhus/boxen-cli) - CLI for this module


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
