var gulp = require('gulp');
var task = gulp.task;
var series = gulp.series;
var parallel = gulp.parallel;
var watch = gulp.watch;
var src = gulp.src;
var dest = gulp.dest;
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
//var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var log = require('fancy-log');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var runSequence = require('gulp4-run-sequence');

var jekyllBundle= 'bundle';
//using exec as spawn didn't seem to work
var jekyllBuild = ['exec','jekyll','build','--config _config.yml,_config_dev.yml'];
var jekyllServe = ['exec','jekyll','serve','-w','--incremental', '--config _config.yml,_config_dev.yml'];
var jekyllDev = ['build', '--drafts', '--config', '_config.yml,_config_dev.yml'];

var reload = browserSync.reload;
var notify = browserSync.notify;
var stream = browserSync.stream;

var init = sourcemaps.init;
var write = sourcemaps.write;

// import { task, src, dest, series, watch, parallel } from 'gulp';
// import csso from 'gulp-csso';
// import uglify from 'gulp-uglify';
// import concat from 'gulp-concat';
// import sass, { logError } from 'gulp-sass';
// import plumber from 'gulp-plumber';
// import imagemin from 'gulp-imagemin';
// import browserSync, { reload as _reload, stream as _stream, notify as _notify } from 'browser-sync';
// //import postcss from 'gulp-postcss';
// import { init, write } from 'gulp-sourcemaps';
// import autoprefixer from 'gulp-autoprefixer';
// import log from 'fancy-log';

// import { exec, spawn } from 'child_process';
// import runSequence from 'gulp4-run-sequence';

/* set our paths to a path variable to bulk update if we add new paths */
var paths = {
    scss:['_src/sass/**/*.scss','_sass/**/*.scss'],  //allowing jekyll to build up the scss to css mainly so really unused
    js:'_src/js/**/*.js',
    fonts: '_src/fonts/**/*.{ttf,woff,woff2}',
    images: '_src/img/**/*.{jpg,png,gif}',
    html:['*html', '_includes/*html', '_layouts/*.html','feed.xml','favicon.ico']
};
//output paths jekyllPaths and sitePaths
var jekyllPaths = {
    css: 'assets/css/',
    js: 'assets/js/',
    fonts: 'assets/fonts/',
    images: 'assets/img/'
};

var sitePaths = {
    css: '_site/assets/css/',
    js: '_site/assets/js/',
    fonts: '_site/assets/fonts/',
    images: '_site/assets/img/'
};

var cb = function(callback){callback();};
/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
task('build-jekyll', function (callback) {
    return spawn(
        jekyllBundle, jekyllBuild,
        {stdio: 'inherit', shell: true})
        .on('close', callback)
        .on('error',log);
});

/*
 * serve the Jekyll Site ignore browserSync as I have issues with it and safari 11
 * runs a child process in node that runs the jekyll commands
 */
task('serve-jekyll', function (callback) {
	return spawn(
        jekyllBundle,
        jekyllServe, 
        {stdio: 'inherit', shell: true})
        .on('close', callback)
        .on('error',log);
});

/*
* Compile and minify sass into Css
* add sourcemap
* add prefixeer for browser compatibility
* move to jekyllpath and site path for display and jekyll build process.
* stream file to browserSync
*/
task('build-sass', function() {
  src(paths.scss)
    .pipe(sass().on('error',logError))
    .pipe(plumber())
    .pipe(init())
        .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 10']}))
        .pipe(csso())
    .pipe(write('.'))
    .pipe(dest(jekyllPaths.css))
    .pipe(dest(sitePaths.css))
    .pipe(stream())
    .on('error',log);
});

/*
* Compile fonts
*/
task('build-fonts', function() {
return src(paths.fonts)
    .pipe(plumber())
    .pipe(dest(jekyllPaths.fonts))
    .pipe(dest(sitePaths.fonts))
    .pipe(stream())
    .on('error',log);
});

/*
 * Minify images
 */
task('build-images', function() {
	return src(paths.images)
        .pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .on('error',log)
        .pipe(dest(jekyllPaths.images))
        .pipe(dest(sitePaths.images))
        .pipe(stream())
        .on('error',log);
});

/**
 * Compile and minify js
 */
task('build-js', function(callback){
	return src(paths.js)
        .pipe(concat('main.js'))
        .on('error',log)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(dest(jekyllPaths.js))
        .pipe(dest(sitePaths.js))
        .on('error',log);
		
});
/*
 * Rebuild Jekyll & reload browserSync
 */
task('build-jekyllWatch', series('build-jekyll', function(callback) {
    reload({stream:true});
    callback();
  }));
/*
 * Rebuild JS & reload browserSync
 */
task('build-jsWatch', series('build-js', function(callback) {
    reload({stream:true});
    callback();
  }));

//gulp based watch task not to be confused with jekyll's -w --watch flag
task('watch', function() {
  watch(paths.scss, series('build-sass'));
  watch(paths.js, series(parallel('js', 'build-jsWatch')));
  watch(paths.fonts, series('build-fonts'));
  watch(paths.images, series('build-images'));
  // Watch html, Jekyll feed.xml and favicon.ico
  watch(paths.html, series('build-jekyllWatch'));
});
    //run scripts in parallel []
    //run next
    //finally callback
task('build-no-sass',series(parallel("build-js","build-images","build-fonts"),cb));

//main default build task.
    //run scripts in parallel []
    //run next
    //finally callback
var defaultBuild = series(parallel("build-js","build-images","build-fonts","build-sass"),"build-jekyll",cb);
task('build',defaultBuild);

var defaultTask = series(parallel('build','watch'))   ;
/*
 * Build the jekyll site and launch browser-sync
 */
task('serve', defaultTask, function(callback) {
	browserSync({
		server: {
            notify: false,
            baseDir: '_site',
            ghostMode: false,
            logFileChanges: true
		}
    });
    callback();
});
//default call to gulp. runs task 'serve' directly above.
task('default', series('serve'));
//when you don't want browserSync,
//these were made if deving with safai 11 and browsersync doesn't work.
var noBrowserSync = series('build-no-sass','serve-jekyll');
task('jekyll-serve', noBrowserSync);

//added this to try and run gh-pages jeykll locally
task('jekyll-dev',function(callback){
    notify("dev build");
    return spawn('jekyll',jekyllDev, {stdio: 'inherit'})
    .on('close',callback)
    .on('error',log);
});