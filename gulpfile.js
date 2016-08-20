var gulp = require('gulp');
var spawn = require('child_process').spawn;

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
