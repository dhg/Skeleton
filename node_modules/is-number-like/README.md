# is-number-like

<!-- VDOC.badges travis; standard; npm; coveralls -->
<!-- DON'T EDIT THIS SECTION (including comments), INSTEAD RE-RUN `vdoc` TO UPDATE -->
[![Build Status](https://travis-ci.org/vigour-io/is-number-like.svg?branch=master)](https://travis-ci.org/vigour-io/is-number-like)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/is-number-like.svg)](https://badge.fury.io/js/is-number-like)
[![Coverage Status](https://coveralls.io/repos/github/vigour-io/is-number-like/badge.svg?branch=master)](https://coveralls.io/github/vigour-io/is-number-like?branch=master)

<!-- VDOC END -->

<!-- VDOC.jsdoc isNumberLike -->
<!-- DON'T EDIT THIS SECTION (including comments), INSTEAD RE-RUN `vdoc` TO UPDATE -->
#### var looksLikeNumber = isNumberLike(val)

Checks whether provided parameter looks like a number
- **val** (*any*) - the value to check
- **returns** (*boolean*) looksLikeNumber - `true` if `val` looks like a number, `false` otherwise

<!-- VDOC END -->


```javascript
const isNumberLike = require('is-number-like')
isNumberLike('2') // true
isNumberLike('a') // false
```
