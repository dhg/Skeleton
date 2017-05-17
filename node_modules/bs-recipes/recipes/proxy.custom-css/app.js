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
