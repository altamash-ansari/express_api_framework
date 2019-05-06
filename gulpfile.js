// Include build number in all deliverables.
const gulp        = require("gulp")
const gulpInstall = require("gulp-install")

gulp.task("npm-install-packages", function(){
  return gulp
  .src(["./**/package.json","!./**/node_modules/**/package.json", "!./package.json"])
  .pipe(gulpInstall())
})