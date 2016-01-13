var gulp            = require('gulp');
var ghPages         = require('gulp-gh-pages');
var browserSync     = require('browser-sync');
var sass            = require('gulp-sass');
var prefix          = require('gulp-autoprefixer');
var cssnano         = require('gulp-cssnano');
var rename          = require('gulp-rename');
var imageminOptipng = require('imagemin-optipng');
var cp              = require('child_process');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Deploy to gh-pages
 */
gulp.task('deploy', ['jekyll-build-prod'], function() {
    return gulp.src('./_site/**/*')
        .pipe(ghPages());
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], { stdio: 'inherit' })
        .on('close', done);
});

/**
 * Build the Jekyll Site for production
 */
gulp.task('jekyll-build-prod', function (done) {
    browserSync.notify(messages.jekyllBuild);

    var productionEnv = process.env;
    productionEnv.JEKYLL_ENV = 'production';

    return cp.spawn('jekyll', ['build'], { stdio: 'inherit' , env:productionEnv })
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        open: false,
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile SCSS files into CSS
 */
gulp.task('sass', function () {
    return gulp.src('assets/css/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/assets/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('assets/css'))
        .pipe(cssnano())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('assets/css'));
});

/**
 * Minify images
 */
gulp.task('images', function () {
    return gulp.src('assets/img/*.png')
        .pipe(imageminOptipng({optimizationLevel: 9})())
        .pipe(gulp.dest('assets/imagemin'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('assets/css/**/*.scss', ['sass']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_pages/*', '_data/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
