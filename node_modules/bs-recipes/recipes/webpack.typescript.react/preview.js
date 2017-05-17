/**
 * Require Browsersync along with webpack and middleware for it
 */
var browserSync          = require('browser-sync').create();
/**
 * Run Browsersync and use middleware for Hot Module Replacement
 */
browserSync.init({
    server: 'app',
    middleware: [
        require('compression')()
    ]
});
