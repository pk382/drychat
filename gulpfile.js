var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserify = require('gulp-browserify');

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    tasks: ['html', 'browserify'],
    ext: 'html js less css'
  });
});

gulp.task('html', function() {
  gulp.src('frontend/index.html')
    .pipe(gulp.dest('.public'));
});

gulp.task('browserify', function() {
  gulp.src('frontend/client.js')
    .pipe(browserify({
      transform: ['reactify']
    }))
    .pipe(gulp.dest('.public'));
});

gulp.task('default', ['html', 'browserify', 'start']);
