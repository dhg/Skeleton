Skeleton SCSS
=============
> This is my opinionated fork of Skeleton, the original author seems to have disappeared and/or lost interest in the project, and my colleagues and I use this an awful lot.

## Whats different here?
My fork has one significant difference over the original project, that is a full SCSS conversion to make use of more modern technologies and to expose a lot more customisation options quickly and easily.

As time goes by I will gradually extend the available options and build a packaging tool that allows you to select all of your customisations in a graphical way, thinking something along the lines of jQuery themeroller, just a bit more lightweight.

## Installing
Either clone this repository and drop in manually, or install from bower:

```
bower install --save Skeleton-SCSS
```

## Build status
The project is set up to build and run csslint on Travis:
Master: [![Build Status](https://travis-ci.org/nickpack/Skeleton-SCSS.png)](https://travis-ci.org/nickpack/Skeleton-SCSS)
Development: [![Build Status](https://travis-ci.org/nickpack/Skeleton-SCSS.png?branch=develop)](https://travis-ci.org/nickpack/Skeleton-SCSS)

## Building
I've added grunt configuration to the repository for those of you that use it.

There are 4 main tasks added:
* build - Runs Sass to create the stylesheet from the source files, places the output in ./css then creates a minified version of the file and places it into the same directory
* lint - This runs CSSLint over the output CSS file (Note that there are a few bits in skeleton that I need to fix!)
* minify - This literally just runs cssmin, useful if you've edited skeleton.css directly
* watch - This will monitor the scss directory for changes and automatically rebuild the css and minified css (Effectively the same as sass --watch but with added minification)

### To get started with the grunt tools
You need to npm install grunt-cli to start with, otherwise you wont have a runner!
Then following that, from the root dir of this project, run `npm install` which will set up all of the required dependencies.

You should be good to go.

## Changelog
* May 17, 2013 - (v1.0.2) Travis CI build configuration, and minor refactor to remove as many of the warnings from CSSLint as was feasible to do - MAY CAUSE REGRESSIONS.
* May 17, 2013 - (v1.0.1) Added grunt build tools
* Apr 23, 2013 - (v1.0.0) Skeleton SCSS v1.0 - Additional variable conversions, changes based on feedback to the original project and bower submission.
* Jan 31, 2013 - Completed SCSS conversion of Skeleton 1.2.

## Contributers
* Nick Pack
* Matthew Copeland
* Miles Z. Sterrett
* AtomicPages LLC
* Toby Vervaart
* Dave Gamache

## Licence
Copyright (c) 2013 Nick Pack
Based on the original skeleton project which is Copyright 2011 Dave Gamache
Licensed under the MIT license.	

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/nickpack/Skeleton-SCSS/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

