'use strict';
const gulp = require('gulp');
const browserSync = require("browser-sync");
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const ejs = require("gulp-ejs");
const watch = require('gulp-watch');
const bower = require('bower-files')();
const inject = require('gulp-inject');
const rigger = require('gulp-rigger');

// Web server
gulp.task('serve', () => {
  browserSync({
    server: {
      baseDir: "./app"
    },
    tunnel: false,
    host: 'localhost',
    port: 2000,
    logPrefix: "Frontend_Zorin"
  });
});

// SCSS
gulp.task('styles', () => {
  gulp.src(['app/scss/*.scss', '!app/scss/_*.scss'])
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(postcss([require('css-mqpacker'), require('postcss-merge-rules')]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css/'));
});

// EJS
gulp.task('ejs', () => {

  var injectStyles = gulp.src([
    'app/css/lib/*.css',
    'app/css/*.css'
  ], {read: false});

  var injectScripts = gulp.src([
    'app/js/lib/jquery.*',
    'app/js/lib/*.js',
    'app/js/*.js'
  ], {read: false});

  var injectOptions = {
    removeTags: true,
    addRootSlash: false,
    ignorePath: 'app',
    addPrefix: '.'
  };

  gulp.src(['app/ejs/*.ejs'])
    .pipe(ejs({}, {
      ext: '.html'
    }))
    .pipe(rigger())
    .pipe(inject(injectStyles, injectOptions))
    .pipe(inject(injectScripts, injectOptions))
    .pipe(gulp.dest('app/'));
});

// Bower
gulp.task('bower', () => {
  gulp.src(bower.ext('js').files)
    .pipe(gulp.dest('app/js/lib/'));
  gulp.src(bower.ext('css').files)
    .pipe(gulp.dest('app/css/lib'));
});

// Build
gulp.task('build', function () {
  gulp.src(['app/scss/*.scss', '!app/scss/_*.scss'])
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(postcss([require('css-mqpacker'), require('postcss-merge-rules')]))
    .pipe(gulp.dest('app/css/'));
  gulp.start('bower');
  gulp.start('ejs');
});

// Watch
gulp.task('watch', function () {
  watch(['app/scss/**/*.*'], function (event, cb) {
    gulp.start('styles');
  });
  watch(['app/ejs/**/*.*'], function (event, cb) {
    gulp.start('ejs');
  });
});

// Default
gulp.task('default', ['bower', 'styles', 'ejs', 'serve', 'watch']);