var gulp = require("gulp");
var autoprefixer = require("gulp-autoprefixer");
var cleanCss = require("gulp-clean-css");
var concat = require("gulp-concat");
var gulpIf = require("gulp-if");
var less = require("gulp-less");
var notify = require("gulp-notify");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var watch = require("gulp-watch");
var browserSync = require("browser-sync").create();

//прописываем пути
var config = {
  paths: {
    less: "./src/less/**/*.less",
    html: "./src/**/*.html",
  },
  output: {
    path: "./public",
    cssName: "bundle.min.css",
    pathHtml: "./public/index.html",
  },
  isDevelop: true,
};

//задачи
gulp.task("less", function (callback) {
  return gulp
    .src(config.paths.less)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Less",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(gulpIf(config.isDevelop, sourcemaps.init()))
    .pipe(less())
    .pipe(concat(config.output.cssName))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 4 versions"],
      })
    )
    .pipe(gulpIf(!config.isDevelop, cleanCss()))
    .pipe(gulpIf(config.isDevelop, sourcemaps.write()))
    .pipe(gulp.dest(config.output.path))
    .pipe(browserSync.stream());
  callback();
});

gulp.task("html", function (callback) {
  return gulp
    .src(config.paths.html)
    .pipe(
      plumber({
        errorHandler: notify.onError(function (err) {
          return {
            title: "Html",
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(gulp.dest(config.output.path))
    .pipe(browserSync.stream());
  callback();
});

//Следим за файлами html  и css
gulp.task("watch", function () {
  //Делаем задержку в 1 секунду, если проект находится на HDD диске, а не на SSD диске
  watch(config.paths.less, function () {
    setTimeout(gulp.parallel("less"), 1000);
  });
  watch(config.paths.html, function () {
    setTimeout(gulp.parallel("html"), 1000);
  });
});

//Задача для старта сервера из папки public
gulp.task("server", function () {
  browserSync.init({ server: { baseDir: config.output.path } });
});

//Дефолтный таск, запускаем одновременно сервер и слежение
gulp.task(
  "default",
  gulp.series(gulp.parallel("less", "html"), gulp.parallel("server", "watch"))
);
