var gulp = require("gulp");
var sass = require("gulp-sass");
var cssnano = require("cssnano");
var autoprefixer = require("autoprefixer");
var sourcemaps = require("gulp-sourcemaps");
var postcss = require("gulp-postcss");
var pxtorem = require("postcss-pxtorem");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var cp = require("child_process");
var flatten = require("gulp-flatten");
var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";
var source = require("vinyl-source-stream");
var concatjs = require("gulp-concat");
var browserSync = require("browser-sync").create();

var paths = {
 styles: {
  // src: '_scss/**/*.scss',
  src: "assets/scss/**/*.scss",
  dest: "_site/css",
  destsecond: "css",
 },
 scripts: {
  src: "assets/js/theme.js",
  dest: "_site/assets/js",
  destsecond: "assets/js",
 },
};

function jekyllBuild() {
 return cp.spawn(jekyll, ["build", "--config", "_config.yml"], { stdio: "inherit" });
}

function style() {
 return (
  gulp
   .src(paths.styles.src)
   .pipe(sourcemaps.init())
   .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
   .pipe(
    postcss([
     autoprefixer(),
    //  pxtorem({
    //   replace: false,
    //   exclude: "/assets/scss/bootstrap/i",
    //  }),
    //  cssnano()
    ])
   )
   .pipe(sourcemaps.write("."))
   .pipe(gulp.dest(paths.styles.dest))
   .pipe(browserSync.reload({ stream: true }))
   .pipe(gulp.dest(paths.styles.destsecond))
 );
}

function js() {
 return gulp
  .src(paths.scripts.src)
  .pipe(gulp.dest(paths.scripts.dest))
  .pipe(browserSync.reload({ stream: true }));
}

function browserSyncServe(done) {
 browserSync.init({
  open: false,
  injectChanges: true,
  server: {
   baseDir: "_site",
  },
 });
 done();
}

function browserSyncReload(done) {
 browserSync.reload();
 done();
}

function watch() {
 gulp.watch(paths.styles.src, style);
 gulp.watch(paths.scripts.src, js);
 gulp.watch(["*.html", "_layouts/*.html", "_pages/*", "_posts/*", "_data/*", "_includes/*"], gulp.series(jekyllBuild, browserSyncReload));
}

gulp.task("default", gulp.parallel(jekyllBuild, browserSyncServe, watch));
