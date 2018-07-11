/* eslint-disable func-names */

'use strict';
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const excludeGitignore = require('gulp-exclude-gitignore');
const mocha = require('gulp-mocha');
const istanbul = require('gulp-istanbul');
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

gulp.task('test', gulp.series('pre-test', function testActual(cb) {
	let mochaErr;
	let callbackCalled = false;

	gulp.src('test/**/*.js')
		.pipe(plumber())
		.pipe(mocha({reporter: 'spec'}))
		.on('error', err => {
			mochaErr = err;
			callCallback();
		})
		.pipe(istanbul.writeReports())
		.on('end', () => {
			callCallback();
		});

	function callCallback() {
		if (callbackCalled) {
			return;
		}

		callbackCalled = true;
		cb(mochaErr);
	}
}));

gulp.task('watch', () => {
	gulp.watch(['generators/**/*.js', 'test/**'], gulp.series('test'));
});

gulp.task('default', gulp.parallel('static', 'test'));
