/*******************************************************************************\ 1.    DEPENDENCIES \*******************************************************************************/var gulp = require('gulp'),    sass = require('gulp-sass'),    jshint = require('gulp-jshint'),    uglify = require('gulp-uglify'),    clean = require('gulp-clean'),    concat = require('gulp-concat'),    notify = require('gulp-notify'),    compass = require('gulp-compass'),    useref = require('gulp-useref'),						// parse build blocks in HTML files to replace references    autoprefixer = require('gulp-autoprefixer'),			// sets missing browserprefixes    browserSync = require('browser-sync').create();			// inject code to all devices/*******************************************************************************\ 2.    BROWSERSYNC (LOCAL SERVEVR) \*******************************************************************************/gulp.task('default', ['watch'], function () {						// files to inject    browserSync.init({        server: {baseDir: "app/"}												// base dir    });});/*******************************************************************************\ 3.    WATCHER (WATCHING FILE CHANGES) \*******************************************************************************/gulp.task('watch', function () {    watching = true;    gulp.watch(['app/*.html'], ['html']);								// watching changes in HTML    gulp.watch(['app/sass/*.scss'], ['styles']);					// watching changes in SASS    gulp.watch(['app/js/*.js'], ['scripts']);								// watching changes in JS});/*******************************************************************************\ 4.    HTML TASKS \*******************************************************************************/gulp.task('html', function () {    gulp.src('app/index.html')													// get the files        .pipe(gulp.dest('app/'))													// where to put the file        .pipe(notify({message: 'HTML task complete'}))        .pipe(browserSync.stream());});/*******************************************************************************\ 5.    STYLES TASKS \*******************************************************************************/gulp.task('styles', function () {    gulp.src('app/sass/screen.scss')													// get the files        .pipe(compass({            css: 'app/dist/css',            sass: 'app/sass',            image: 'app/img',            style: 'expanded'        }))        //.pipe(sass())        .pipe(sass().on('error', sass.logError))        .pipe(autoprefixer({browsers: ['last 3 versions'], cascade: false}))        .pipe(gulp.dest('app/dist/css'))        .pipe(notify({message: 'Styles task complete'}))// where to put the file        .pipe(browserSync.stream());												// browsersync stream});/*******************************************************************************\ JS TASKS \*******************************************************************************/gulp.task('scripts', function () {    return gulp.src(['app/js/script.js'])        .pipe(concat('build.min.js'))        .pipe(gulp.dest('app/dist/js'))        .pipe(notify({message: 'Scripts task complete'}))        .pipe(browserSync.stream()); 												// browsersync stream});