var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var log = require('fancy-log');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var runSequence = require('run-sequence');

var jekyllBundle= 'bundle';
//using exec as spawn didn't seem to work
var jekyllBuild = ['exec','jekyll','build','--config _config.yml,_config_dev.yml'];
var jekyllServe = ['exec','jekyll','serve','-w','--incremental', '--config _config.yml,_config_dev.yml'];

var reload = browserSync.reload;
/* set our paths to a path variable to bulk update if we add new paths */
var paths = {
    scss:['_src/sass/**/*.scss','_sass/**/*.scss'],  //allowing jekyll to build up the scss to css mainly so really unused
    js:'_src/js/**/*.js',
    fonts: '_src/fonts/**/*.{ttf,woff,woff2}',
    images: '_src/img/**/*.{jpg,png,gif}'
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

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
gulp.task('build-jekyll', function (callback) {
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
gulp.task('serve-jekyll', function (callback) {
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
gulp.task('build-sass', function() {
  gulp.src(paths.scss)
    .pipe(sass().on('error',sass.logError))
    .pipe(plumber())
    
    .pipe(sourcemaps.init())
        .pipe(autoprefixer({browsers: ['last 2 versions', 'ie >= 10']}))
        .pipe(csso())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(jekyllPaths.css))
    .pipe(gulp.dest(sitePaths.css))
    .pipe(browserSync.stream())
    .on('error',log);
});

/*
* Compile fonts
*/
gulp.task('build-fonts', function() {
    gulp.src(paths.fonts)
    .pipe(plumber())
    .pipe(gulp.dest(jekyllPaths.fonts))
    .pipe(gulp.dest(sitePaths.fonts))
    .pipe(browserSync.stream())
    .on('error',log);
})

/*
 * Minify images
 */
gulp.task('build-images', function() {
	return gulp.src(paths.images)
		.pipe(plumber())
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .on('error',log)
        .pipe(gulp.dest(jekyllPaths.images))
        .pipe(gulp.dest(sitePaths.images))
        .pipe(browserSync.stream())
        .on('error',log);
});

/**
 * Compile and minify js
 */
gulp.task('build-js', function(){
	return gulp.src(paths.js)
        .pipe(concat('main.js'))
        .on('error',log)
        .pipe(plumber())
        .pipe(uglify())
        .pipe(gulp.dest(jekyllPaths.js))
        .on('error',log)
        .pipe(gulp.dest(sitePaths.js))
        .on('error',log);
		
});
/*
 * Rebuild Jekyll & reload browserSync
 */
gulp.task('build-jekyllWatch', ['build-jekyll'], function(callback) {
    browserSync.reload();
    callback();
  });
/*
 * Rebuild JS & reload browserSync
 */
gulp.task('build-jsWatch', ['build-js'], function(callback) {
    browserSync.reload();
    callback();
  });
//gulp based watch task not to be confused with jekyll's -w --watch flag
gulp.task('watch', function() {
  gulp.watch(paths.scss, ['build-sass']);
  gulp.watch(paths.js, ['js', 'build-jsWatch']);
  gulp.watch(paths.fonts, ['build-fonts']);
  gulp.watch(paths.images, ['build-images']);
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], ['build-jekyllWatch']);
  // Watch Jekyll RSS feed XML file
  gulp.watch('feed.xml', ['build-jekyllWatch']);
  // Watch Jekyll favicon.ico
  gulp.watch('favicon.ico', ['build-jekyllWatch']);
});

//main default build task.
gulp.task('build',function(callback){
    //run scripts in parallel []
    //run next
    //finally callback
    runSequence(["build-js","build-images","build-fonts","build-sass"],"build-jekyll",callback)
});

gulp.task('build-no-sass',function(callback){
    //run scripts in parallel []
    //run next
    //finally callback
    runSequence(["build-js","build-images","build-fonts"],callback);
});
/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task('serve', ['build','watch'], function(callback) {
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
//default call to gulp.
gulp.task('default', ['serve']);
//when you don't want browserSync,
//these were made if deving with safai 11 and browsersync doesn't work.
gulp.task('jekyll-serve', ['build-no-sass','serve-jekyll']);