var gulp = require('gulp');
var stylus = require('gulp-stylus');
var csso = require('gulp-csso');
var rename = require('gulp-rename');

// css task
gulp.task('css', function() {
  return gulp.src('src/styl/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('dist/css'))
    .pipe(csso())
    .pipe(rename('skeleton.min.css'))
    .pipe(gulp.dest('dist/css'));
});

// build task
gulp.task('build', ['css']);
