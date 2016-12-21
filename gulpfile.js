'use strict';
const path = require('path');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
const nsp = require('gulp-nsp');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');

gulp.task('static', () => {
	return gulp.src('**/*.js')
		.pipe(filter([
			'**',
			'!generators/extension/templates/**'
		]))
		.pipe(excludeGitignore())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task('nsp', cb => {
	nsp({package: path.resolve('package.json')}, cb);
});

gulp.task('pre-test', () => {
	return gulp.src('generators/**/*.js')
		.pipe(filter([
			'**',
			'!generators/extension/templates/**'
		]))
		.pipe(excludeGitignore())
		.pipe(istanbul({
			includeUntested: true
		}))
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], cb => {
	let mochaErr;

	gulp.src('test/**/*.js')
		.pipe(plumber())
		.pipe(mocha({reporter: 'spec'}))
		.on('error', err => {
			mochaErr = err;
		})
		.pipe(istanbul.writeReports())
		.on('end', () => {
			cb(mochaErr);
		});
});

gulp.task('watch', () => {
	gulp.watch(['generators/**/*.js', 'test/**'], ['test']);
});

gulp.task('prepublish', ['nsp']);
gulp.task('default', ['static', 'test']);
