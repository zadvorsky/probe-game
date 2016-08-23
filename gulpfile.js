var gulp = require('gulp');
var include = require('gulp-include');
var runSequence = require('run-sequence');
var del = require('del');
var watch = require('gulp-watch');
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

gulp.task('start-server', function() {
  if (node) node.kill();
  node = spawn('node', ['index.js'], {stdio: 'inherit'});
  node.on('close', function(code) {
    if (code === 8) gulp.log('Error detected, waiting for changes...');
  });
});

gulp.task('watch-server', function() {
  gulp.start('start-server');
  watch(['./index.js'], function() {
    gulp.start('start-server');
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

var editorSources = [
  './editor/**/*.js' ,
  './engine/**/*.js'
];

var editorAssets = [
  './editor/**/*.html',
  './assets/**/*.*'
];

gulp.task('build-editor-js', function() {
  return gulp.src(editorSources)
    .pipe(include())
    .on('error', console.log)
    .pipe(gulp.dest('./bin/editor'));
});

gulp.task('watch-editor-js', function() {
  watch(editorSources, function() {
    gulp.start('build-editor-js');
  });
});

gulp.task('build-editor-assets', function() {
  return gulp.src(editorAssets, {base: './'})
    .pipe(gulp.dest('./bin'));
});

gulp.task('watch-editor-assets', function() {
  watch(editorAssets, function() {
    gulp.start('build-editor-assets');
  });
});

gulp.task('build-editor', function() {
  runSequence(
    'build-clean',
    'build-editor-assets',
    'build-editor-js'
  );
});

gulp.task('editor', function() {
  runSequence(
    'build-editor',
    'watch-server',
    'watch-editor-js',
    'watch-editor-assets'
  );
});
