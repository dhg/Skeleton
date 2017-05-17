# lite-server

Lightweight *development only* node server that serves a web app, opens it in the browser, refreshes when html or javascript change, injects CSS changes using sockets, and has a fallback page when a route is not found.

[![Dependency Status](https://david-dm.org/johnpapa/lite-server.svg)](https://david-dm.org/johnpapa/lite-server)
[![npm version](https://badge.fury.io/js/lite-server.svg)](http://badge.fury.io/js/lite-server)
[![Build Status](https://travis-ci.org/johnpapa/lite-server.svg?branch=master)](https://travis-ci.org/johnpapa/lite-server)

## Why

BrowserSync does most of what we want in a super fast lightweight development server. It serves the static content, detects changes, refreshes the browser, and offers many customizations.

When creating a SPA there are routes that are only known to the browser. For example, `/customer/21` may be a client side route for an Angular app. If this route is entered manually or linked to directly as the entry point of the Angular app (aka a deep link) the static server will receive the request, because Angular is not loaded yet. The server will not find a match for the route and thus return a 404. The desired behavior in this case is to return the `index.html` (or whatever starting page of the app we have defined). BrowserSync does not automatically allow for a fallback page. But it does allow for custom middleware. This is where `lite-server` steps in.

`lite-server` is a simple customized wrapper around BrowserSync to make it easy to serve SPAs.

## Installation and Usage

The recommended installation method is a local NPM install for your project:

```bash
$ npm install lite-server --save-dev
$ yarn add lite-server --dev # or yarn
```

...and add a "script" entry within your project's `package.json` file:

```json
# Inside package.json...
  "scripts": {    
    "dev": "lite-server"
  },
```

With the above script entry, you can then start `lite-server` via:

```bash
$ npm run dev
```

Other options for running locally installed NPM binaries is discussed in this Stack Overflow question: [How to use package installed locally in node_modules](http://stackoverflow.com/q/9679932)

### Global Installation

lite-server can be also installed globally, if preferred:

```bash
$ npm install -g lite-server

# To run:
$ lite-server
```

## Custom Configuration

The default behavior serves from the current folder, opens a browser, and applies a HTML5 route fallback to `./index.html`.

lite-server uses [BrowserSync](https://www.browsersync.io/), and allows for configuration overrides via a local `bs-config.json` or `bs-config.js` file in your project.

You can provide custom path to your config file via `-c` or `--config=` run time options:

```bash
lite-server -c configs/my-bs-config.js
```

For example, to change the server port, watched file paths, and base directory for your project, create a `bs-config.json` in your project's folder:

```json
{
  "port": 8000,
  "files": ["./src/**/*.{html,htm,css,js}"],
  "server": { "baseDir": "./src" }
}
```

You can also provide custom path to your base directory `--baseDir=` run time options:

```bash
lite-server --baseDir="dist"
```

A more complicated example with modifications to the server middleware can be done with a `bs-config.js` file, which requires the `module.exports = { ... };` syntax:

```js
module.exports = {
  server: {
    middleware: {
      // overrides the second middleware default with new settings
      1: require('connect-history-api-fallback')({index: '/index.html', verbose: true})
    }
  }
};
```

The `bs-config.js` file may also export a function that receives the lite-server Browsersync instance as its only argument. While not required, the return value of this function will be used to extend the default lite-server configuration.

```js
module.exports = function(bs) {

  return {
    server: {
      middleware: {
        // overrides the second middleware default with new settings
        1: require('connect-history-api-fallback')({
          index: '/index.html',
          verbose: true
        })
      }
    }
  };

};
```

**NOTE:** Keep in mind that when using middleware overrides the specific middleware module must be installed in your project. For the above example, you'll need to do:

```bash
$ npm install connect-history-api-fallback --save-dev
```

...otherwise you'll get an error similar to:

```
Error: Cannot find module 'connect-history-api-fallback'
```

Another example: To remove one of the [default middlewares](./lib/config-defaults.js), such as `connect-logger`, you can set it's array index to `null`:

```js
module.exports = {
  server: {
    middleware: {
      0: null     // removes default `connect-logger` middleware
    }
  }
};
```

A list of the entire set of BrowserSync options can be found in its docs: <http://www.browsersync.io/docs/options/>

## Testing

When using `lite-server` to run end to end tests, we may not want to log verbosely. We may also want to prevent the browser from opening. These options in the `bs-config.js` will silence all logging from `lite-server`:

```js
  open: false
  logLevel: "silent",
  server: {
    middleware: {
      0: null
    }
  }
```

## Known Issues

CSS with Angular 2 is embedded thus even though BrowserSync detects the file change to CSS, it does not inject the file via sockets. As a workaround, `injectChanges` defaults to `false`.

## Contributing

1.  Fork and clone it
1.  Install dependencies: `npm install`
1.  Create a feature branch: `git checkout -b new-feature`
1.  Commit changes: `git commit -am 'Added a feature'`
1.  Run static code analysis and unit tests: `npm test`
1.  Push to the remote branch: `git push origin new-feature`
1.  Create a new [Pull Request](https://github.com/johnpapa/lite-server/pull/new/master)

## License

Code released under the [MIT license](./LICENSE).
