var gulp = require('gulp');
var nodemon = require('gulp-nodemon');

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    ext: 'html js less css'
  });
});

gulp.task('default', ['start']);
