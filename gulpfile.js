var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserify = require('gulp-browserify');
var less = require('gulp-less');

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    tasks: ['html', 'less', 'browserify', 'thirdparty', 'images'],
    ext: 'html js less css'
  });
});

gulp.task('html', function() {
  gulp.src('frontend/index.html')
    .pipe(gulp.dest('.public'));
});

gulp.task('less', function () {
  return gulp.src('frontend/less/master.less')
    .pipe(less())
    .pipe(gulp.dest('.public/css'));
});

gulp.task('thirdparty', function () {
  return gulp.src('frontend/thirdparty/**')
    .pipe(gulp.dest('.public/thirdparty'));
});

gulp.task('browserify', function() {
  gulp.src('frontend/client.js')
    .pipe(browserify({
      transform: ['reactify']
    }))
    .pipe(gulp.dest('.public'));
});

gulp.task('images', function() {
  gulp.src('frontend/images/**')
      .pipe(gulp.dest('.public/images'));
});

gulp.task('default', ['html', 'less', 'browserify', 'thirdparty', 'images', 'start']);
