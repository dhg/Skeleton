#Browsersync - Gulp, SASS + Pug Templates

## Installation/Usage:

To try this example, follow these 4 simple steps. 

**Step 1**: Clone this entire repo
```bash
$ git clone https://github.com/Browsersync/recipes.git bs-recipes
```

**Step 2**: Move into the directory containing this example
```bash
$ cd bs-recipes/recipes/gulp.pug
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

This is an upgraded version of [gulp.jade recipe](https://github.com/Browsersync/recipes/tree/master/recipes/gulp.jade) from [BrowserSync](https://github.com/browsersync/browser-sync) .

Some useful links:

  - template engine : [pug documentation](https://pugjs.org/api/reference.html)
    (was: Jade)
    - and its integration with gulp: [gulp-pug](https://www.npmjs.com/package/gulp-pug)
  - css preprocessing : [node-sass](https://www.npmjs.com/package/node-sass)
    - and its integration with
      gulp: [gulp-sass](https://www.npmjs.com/package/gulp-pug)
  - and of course [gulp](https://github.com/gulpjs/gulp/blob/master/docs/README.md)

### Preview of `gulpfile.js`:
```js
var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var pug         = require('gulp-pug');
var reload      = browserSync.reload;

/**
 * Compile pug files into HTML
 */
gulp.task('templates', function() {

    var YOUR_LOCALS = {
        "message": "This app is powered by gulp.pug recipe for BrowserSync"
    };

    return gulp.src('./app/*.pug')
        .pipe(pug({
            locals: YOUR_LOCALS
        }))
        .pipe(gulp.dest('./dist/'));
});

/**
 * Important!!
 * Separate task for the reaction to `.pug` files
 */
gulp.task('pug-watch', ['templates'], reload);

/**
 * Sass task for live injecting into all browsers
 */
gulp.task('sass', function () {
    return gulp.src('./app/scss/*.scss')
        .pipe(sass()).on('error', sass.logError)
        .pipe(gulp.dest('./dist/css'))
        .pipe(reload({stream: true}));
});

/**
 * Serve and watch the scss/pug files for changes
 */
gulp.task('default', ['sass', 'templates'], function () {

    browserSync({server: './dist'});


    gulp.watch('./app/scss/*.scss', ['sass']);
    gulp.watch('./app/*.pug',       ['pug-watch']);
});

```

