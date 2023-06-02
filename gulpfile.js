const gulp = require('gulp');
const concat = require('gulp-concat');

const files = [
  'header.js',
  'css.js',
  'main.js'
].map(file => 'src/' + file)

gulp.task('build', function () {
  return gulp.src(files)
    .pipe(concat('Splitter.user.js'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function () {
  return gulp.watch(files, gulp.series('build'));
});

gulp.task('default', gulp.series('build', 'watch'));