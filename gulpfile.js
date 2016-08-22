var gulp = require('gulp');
var include = require('gulp-include');
var runSequence = require('run-sequence');
var del = require('del');
var spawn = require('child_process').spawn;

//////////////////////////////
// GENERAL
//////////////////////////////

gulp.task('build-clean', function(callback) {
  return del(['bin/**'], callback);
});

//////////////////////////////
// NODE SERVER
//////////////////////////////

var node;

gulp.task('server', function() {
  if (node) node.kill();
  node = spawn('node', ['index.js'], {stdio: 'inherit'});
  node.on('close', function(code) {
    if (code === 8) gulp.log('Error detected, waiting for changes...');
  });
});

gulp.task('default', function() {
  gulp.start('server');
  gulp.watch(['./index.js'], function() {
    gulp.start('server');
  });
});

process.on('exit', function() {
  if (node) node.kill()
});

//////////////////////////////
// ENGINE
//////////////////////////////

gulp.task('build-engine', function() {
  return gulp.src(['./engine/**/*.js'])
    .pipe(include())
    .on('error', console.log)
    .pipe(gulp.dest('./bin/engine'));
});

//////////////////////////////
// EDITOR
//////////////////////////////

gulp.task('build-editor-js', function() {
  return gulp.src(['./editor/**/*.js'])
    .pipe(include())
    .on('error', console.log)
    .pipe(gulp.dest('./bin/editor'));
});

gulp.task('build-editor-assets', function() {
  return gulp.src(['./editor/**/*.html', './assets/**/*.*'], {base: './'})
    .pipe(gulp.dest('./bin'));
});

gulp.task('build-editor', function() {
  runSequence(
    'build-clean',
    //'build-engine',
    'build-editor-assets',
    'build-editor-js'
  )
});
