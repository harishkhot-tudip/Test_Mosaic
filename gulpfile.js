var gulp = require('gulp');
var less = require('gulp-less');
var inline64 = require('gulp-inline-base64');
var requirejs = require('requirejs');
var rjsConfig = require('./tools/node-gulp-build.conf')();
var packageJson = require('./package.json');
var rework = require('gulp-rework');
var namespaceCss = require('rework-namespace-css');

var src = {
    'less': './src/less/**/*.less',
    'js': './src/**/*.js'
};

var dest = {
    'css': './dist/styles/',
    'js': './dist/'
};

gulp.task('less', function () {
    var prefix = '[data-lf-package="' + packageJson.name + '#' + packageJson.version + '"]';

    return gulp.src(src.less)
        .pipe(less({ paths: [ __dirname ] }))
        .pipe(inline64({baseDir: './lib/livefyre-bootstrap/src/', debug: true}))
        .pipe(rework(namespaceCss({selector: prefix, root: '.carousel-view'})))
        .pipe(gulp.dest(dest.css));
});

function compileJS(min) {
    min = min || false;

    if (min) {
        rjsConfig.out = dest.js + 'mosaic-component.min.js';
        rjsConfig.optimize = "uglify2";
    }
    else {
        rjsConfig.out = dest.js + 'mosaic-component.js';
        rjsConfig.optimize = "none";
    }

    return requirejs.optimize(rjsConfig, function (resp) {
        console.log((min ? 'Minified' : 'Unminified') + ' File Built');
        if (!min) {
            compileJS(true);
        }
    }, function (err) {});
}

gulp.task('rjs', ['less'], function () {
    return compileJS();
});

gulp.task('watch', function () {
    gulp.watch(src.less, ['less']);
});

gulp.task('default', ['less', 'watch']);
gulp.task('build', ['less', 'rjs']);