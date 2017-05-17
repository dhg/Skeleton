#Browsersync - Proxy example + injecting custom css file

## Installation/Usage:

To try this example, follow these 4 simple steps. 

**Step 1**: Clone this entire repo
```bash
$ git clone https://github.com/Browsersync/recipes.git bs-recipes
```

**Step 2**: Move into the directory containing this example
```bash
$ cd bs-recipes/recipes/proxy.custom-css
```

**Step 3**: Install dependencies
```bash
$ npm install
```

**Step 4**: Run the example
```bash
$ npm start
```

### Additional Info:



To see the live-updating and CSS injecting, simply perform changes to `app/static/_custom.css`

### Preview of `app.js`:
```js
/**
 * Require Browsersync
 */
var browserSync = require('browser-sync').create();

/**
 * Run Browsersync with server config
 * You can use an arrays for files to specify multiple files
 */
browserSync.init({
    proxy: "example.com",
    serveStatic: ["app/static"],
    files: "app/static/_custom.css",
    snippetOptions: {
        rule: {
            match: /<\/head>/i,
            fn: function (snippet, match) {
                return '<link rel="stylesheet" type="text/css" href="/_custom.css"/>' + snippet + match;
            }
        }
    }
});

```

