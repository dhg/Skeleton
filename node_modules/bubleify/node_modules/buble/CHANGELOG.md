# buble changelog

## 0.12.5

* Prevent reserved words being used as identifiers ([#86](https://gitlab.com/Rich-Harris/buble/issues/86))
* Use correct `this` when transpiling `super` inside arrow function ([#89](https://gitlab.com/Rich-Harris/buble/issues/89))
* Handle body-less `for-of` loops ([#80](https://gitlab.com/Rich-Harris/buble/issues/80))

## 0.12.4

* Allow references to precede declaration (inside function) in block scoping ([#87](https://gitlab.com/Rich-Harris/buble/issues/87))

## 0.12.3

* Argh, npm

## 0.12.2

* Files missing in 0.12.1 (???)

## 0.12.1

* Don't require space before parens of shorthand computed method ([#82](https://gitlab.com/Rich-Harris/buble/issues/82))
* Allow string keys for shorthand methods ([#82](https://gitlab.com/Rich-Harris/buble/issues/82))

## 0.12.0

* Support `u` flag in regular expression literals ([!62](https://gitlab.com/Rich-Harris/buble/merge_requests/62))
* Save `buble/register` transformations to `$HOME/.buble-cache` ([!63](https://gitlab.com/Rich-Harris/buble/merge_requests/63))

## 0.11.6

* Allow shorthand methods with computed names ([#78](https://gitlab.com/Rich-Harris/buble/issues/78))
* Include code snippet in `error.toString()` ([#79](https://gitlab.com/Rich-Harris/buble/issues/79))

## 0.11.5

* Preserve whitespace between JSX tags on single line ([#65](https://gitlab.com/Rich-Harris/buble/issues/65))

## 0.11.4

* Allow computed class methods, except accessors ([!56](https://gitlab.com/Rich-Harris/buble/merge_requests/56))
* Compound destructuring ([!58](https://gitlab.com/Rich-Harris/buble/merge_requests/58))

## 0.11.3

* Ensure inserted statements follow use strict pragma ([#72](https://gitlab.com/Rich-Harris/buble/issues/72))

## 0.11.2

* Ensure closing parenthesis is in correct place when transpiling inline computed property object expressions ([#73](https://gitlab.com/Rich-Harris/buble/issues/73))

## 0.11.1

* Fix computed property followed by non-computed property in inline expression

## 0.11.0

* Computed properties ([#67](https://gitlab.com/Rich-Harris/buble/issues/67))
* Allow `super(...)` to use rest arguments ([#69](https://gitlab.com/Rich-Harris/buble/issues/69))

## 0.10.7

* Allow customisation of `Object.assign` (used in object spread) ([!51](https://gitlab.com/Rich-Harris/buble/merge_requests/51))

## 0.10.6

* Handle sparse arrays ([#62](https://gitlab.com/Rich-Harris/buble/issues/62))
* Handle spread expressions in JSX ([#64](https://gitlab.com/Rich-Harris/buble/issues/64))

## 0.10.5

* Create intermediate directories when transforming via CLI ([#63](https://gitlab.com/Rich-Harris/buble/issues/63))
* Update README ([#57](https://gitlab.com/Rich-Harris/buble/issues/57))

## 0.10.4

* Support spread operator in object literals ([!45](https://gitlab.com/Rich-Harris/buble/merge_requests/45)) and JSX elements ([!46](https://gitlab.com/Rich-Harris/buble/merge_requests/46))

## 0.10.3

* Disable intelligent destructuring, temporarily ([#53](https://gitlab.com/Rich-Harris/buble/issues/53))
* Fix whitespace in JSX literals ([!39](https://gitlab.com/Rich-Harris/buble/merge_requests/39))
* Add `: true` to value-less JSX attributes ([!40](https://gitlab.com/Rich-Harris/buble/merge_requests/40))
* Quote invalid attribute names ([!41](https://gitlab.com/Rich-Harris/buble/merge_requests/41))

## 0.10.2

* Don't add closing quote to JSX component without attributes ([#58](https://gitlab.com/Rich-Harris/buble/issues/58))

## 0.10.1

* Fix handling of literals inside JSX

## 0.10.0

* Basic JSX support

## 0.9.3

* Better spread operator support, including with `arguments` ([#40](https://gitlab.com/Rich-Harris/buble/issues/40))
* Fix indentation of inserted statements in class constructors ([#39](https://gitlab.com/Rich-Harris/buble/issues/39))

## 0.9.2

* Allow class to have accessors and no constructor ([#48](https://gitlab.com/Rich-Harris/buble/issues/48))
* Fix help message in CLI

## 0.9.1

* Prevent confusion over `Literal` node keys

## 0.9.0

* More complete and robust destructuring support ([#37](https://gitlab.com/Rich-Harris/buble/issues/37), [#43](https://gitlab.com/Rich-Harris/buble/issues/43))
* Correct `this`/`arguments` references inside for-of loop

## 0.8.5

* Allow destructured parameter to have default ([#43](https://gitlab.com/Rich-Harris/buble/issues/43))
* Allow `continue`/`break` statements inside a for-of loop

## 0.8.4

* Allow class body to follow ID/superclass without whitespace ([#46](https://gitlab.com/Rich-Harris/buble/issues/46))

## 0.8.3

* Performance enhancements ([!23](https://gitlab.com/Rich-Harris/buble/merge_requests/23))

## 0.8.2

* More robust version of ([!22](https://gitlab.com/Rich-Harris/buble/merge_requests/22))

## 0.8.1

* Fix `export default class A extends B` (broken in 0.8.0) ([!22](https://gitlab.com/Rich-Harris/buble/merge_requests/22))

## 0.8.0

* Subclasses inherit static methods ([#33](https://gitlab.com/Rich-Harris/buble/issues/33))
* Performance enhancements ([!21](https://gitlab.com/Rich-Harris/buble/merge_requests/21))

## 0.7.1

* Prevent omission of closing paren in template string ([#42](https://gitlab.com/Rich-Harris/buble/issues/42))
* Separate variable declarations for each name in destructured declaration ([#18](https://gitlab.com/Rich-Harris/buble/merge_requests/18))

## 0.7.0

* Allow arrow functions to be used as default parameter values ([#36](https://gitlab.com/Rich-Harris/buble/issues/36))

## 0.6.7

* Support `static get` and `set` in classes ([#34](https://gitlab.com/Rich-Harris/buble/issues/34))
* Support spread operator in expression method call ([!14](https://gitlab.com/Rich-Harris/buble/merge_requests/14))
* Fix `for-of` loops with no space after opening paren ([#35](https://gitlab.com/Rich-Harris/buble/issues/35))

## 0.6.6

* Fix another subclass `super()` bug ([#32](https://gitlab.com/Rich-Harris/buble/issues/32))

## 0.6.5

* Fix `super()` call in subclass expression ([#32](https://gitlab.com/Rich-Harris/buble/issues/32))
* Less defensive template string parenthesising ([!9](https://gitlab.com/Rich-Harris/buble/merge_requests/9))

## 0.6.4

* Add Node 6 to support matrix

## 0.6.3

* Handle empty template strings ([#28](https://gitlab.com/Rich-Harris/buble/issues/28))

## 0.6.2

* Handle body-less do-while blocks ([#27](https://gitlab.com/Rich-Harris/buble/issues/27))

## 0.6.1

* Always remember to close parens in template strings

## 0.6.0

* Strip unnecessary empty strings from template literals
* Intelligent destructuring for object patterns in parameters ([#17](https://gitlab.com/Rich-Harris/buble/issues/17))

## 0.5.8

* Fix exponentiation assignment operator edge case

## 0.5.7

* Exponentiation operator support ([#24](https://gitlab.com/Rich-Harris/buble/issues/24))
* More informative error messages for for-of and tagged template strings

## 0.5.6

* Add `dangerousTaggedTemplateString` ([!2](https://gitlab.com/Rich-Harris/buble/merge_requests/2)) and `dangerousForOf` ([!3](https://gitlab.com/Rich-Harris/buble/merge_requests/3)) transforms
* Prevent deindentation causing errors with removed whitespace in class methods
* Use correct identifier with default destructured function parameters ([#23](https://gitlab.com/Rich-Harris/buble/issues/23))


## 0.5.5

* Ensure `return` is in correct place when creating bodies for arrow functions ([#21](https://gitlab.com/Rich-Harris/buble/issues/21))
* Prevent deindentation of class methods causing breakage with destructuring statements ([#22](https://gitlab.com/Rich-Harris/buble/issues/22))

## 0.5.4

* Install missing `chalk` dependency
* Informative error messages when `buble/register` fails

## 0.5.3

* Add `register.js` to package. Yes I'm an idiot

## 0.5.2

* Add `buble/register` for use with e.g. Mocha

## 0.5.1

* Remove unused dependency

## 0.5.0

* Support `--target`, `--yes` and `--no` in CLI
* Compile entire directory of files via CLI
* Sourcemap support in CLI
* All transforms can be disabled (or errors suppressed) with the `transforms` option (or `--yes` and `--no`, in the CLI)
* `import` and `export` will throw an error unless `--no modules` transform is specified
* Fix bug with destructuring
* Fix bug with block scoping and loops


## 0.4.24

* Throw if `let`/`const` is redeclared, or `var` is redeclared with a `let`/`const` (0.4.22 regression)

## 0.4.23

* Add `buble.VERSION`
* Tidy up build process (don't bundle Acorn incorrectly)

## 0.4.22

* Allow double `var` declarations (only throw if `let` or `const` is redeclared)

## 0.4.21

* Add `find` and `findIndex` helpers for 0.12 support

## 0.4.20

* Bump to resolve unknown npm issue

## 0.4.19

* Fix block scoping bug with for loops that don't need to be rewritten as functions

## 0.4.18

* Fix break-inside-switch bug

## 0.4.17

* Support `for...in` loops and block scoping

## 0.4.16

* Add `ie` and `edge` to support matrix

## 0.4.15

* Rewrite reserved properties if specified ([#9](https://gitlab.com/Rich-Harris/buble/issues/9))

## 0.4.14

* Allow classes to extend expressions ([#15](https://gitlab.com/Rich-Harris/buble/issues/15))
* Experimental (partially implemented) API for disabling transforms based on target environment or custom requirements

## 0.4.13

* Fix return statement bug

## 0.4.12

* More complete and robust transpilation of loops that need to be rewritten as functions to simulate block scoping ([#11](https://gitlab.com/Rich-Harris/buble/issues/11), [#12](https://gitlab.com/Rich-Harris/buble/issues/12), [#13](https://gitlab.com/Rich-Harris/buble/issues/13))

## 0.4.11

* Remove source-map-support from CLI (only useful during development)

## 0.4.10

* Basic support for spread operator

## 0.4.9

* Support getters and setters on subclasses
* Disallow unsupported features e.g. generators

## 0.4.8

* Support getters and setters on classes
* Allow identifiers to be renamed in block-scoped destructuring ([#8](https://gitlab.com/Rich-Harris/buble/issues/8))
* Transpile body-less arrow functions correctly ([#9](https://gitlab.com/Rich-Harris/buble/issues/4))

## 0.4.7

* Add browser version

## 0.4.6

* Report locations of parse/compile errors ([#4](https://gitlab.com/Rich-Harris/buble/issues/4))

## 0.4.5

* Sourcemap support

## 0.4.4

* Support for class expressions
* More robust deconflicting
* Various bugfixes

## 0.4.3

* Handle arbitrary whitespace inside template literals

## 0.4.2

* Fix bug-inducing typo

## 0.4.1

* Rest parameters

## 0.4.0

* Self-hosting!

## 0.3.4

* Class inheritance

## 0.3.3

* Handle quote marks in template literals

## 0.3.2

* Handle empty `class` declarations

## 0.3.1

* Add `bin` to package

## 0.3.0

* (Very) basic CLI
* Handle `export default class ...`

## 0.2.2

* Initialise children of Property nodes
* Prevent false positives with reference detection

## 0.2.1

* Add missing files

## 0.2.0

* Support for a bunch more ES2015 features

## 0.1.0

* First (experimental) release
