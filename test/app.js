'use strict';
var _ = require('lodash');
var mockery = require('mockery');
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('nodecg:app', function () {
	before(function () {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerMock('npm-name', function (name, cb) {
			cb(null, true);
		});

		mockery.registerMock('github-username', function (name, cb) {
			cb(null, 'unicornUser');
		});

		mockery.registerMock(
			require.resolve('generator-license'),
			helpers.createDummyGenerator()
		);
	});

	after(function () {
		mockery.disable();
	});

	describe('running on new project', function () {
		before(function (done) {
			this.timeout(4000);
			this.answers = {
				name: 'test-bundle',
				description: 'A NodeCG bundle',
				homepage: 'http://nodecg.com',
				githubAccount: 'nodecg',
				authorName: 'Alex Van Camp',
				authorEmail: 'email@alexvan.camp',
				authorUrl: 'http://alexvan.camp/',
				keywords: ['foo', 'bar']
			};
			helpers.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers)
				.on('end', done);
		});

		it('creates files', function () {
			assert.file([
				'README.md'
			]);
		});

		it('creates package.json', function () {
			assert.file('package.json');
			assert.jsonFileContent('package.json', {
				name: 'test-bundle',
				version: '0.0.0',
				description: this.answers.description,
				homepage: this.answers.homepage,
				repository: 'nodecg/test-bundle',
				author: {
					name: this.answers.authorName,
					email: this.answers.authorEmail,
					url: this.answers.authorUrl
				},
				files: [
					'dashboard',
					'graphics',
					'extension.js',
					'extension'
				],
				keywords: [
					'foo',
					'bar',
					'nodecg-bundle'
				],
				nodecg: {
					compatibleRange: '~0.7.0'
				}
			});
		});

		it('creates and fill contents in README.md', function () {
			assert.file('README.md');
			assert.fileContent('README.md', 'test-bundle is a [NodeCG](http://github.com/nodecg/nodecg) bundle.');
		});
	});

	describe('running on existing project', function () {
		before(function (done) {
			this.pkg = {
				version: '1.0.34',
				description: 'lots of fun',
				homepage: 'http://nodecg.com',
				repository: 'nodecg/test-bundle',
				author: 'Alex Van Camp',
				files: [
					'dashboard',
					'graphics',
					'extension.js',
					'extension'
				],
				keywords: ['bar', 'nodecg-bundle'],
				nodecg: {
					compatibleRange: '~0.7.0'
				}
			};
			helpers.run(path.join(__dirname, '../generators/app'))
				.withPrompts({
					name: 'test-bundle'
				})
				.on('ready', function (gen) {
					gen.fs.writeJSON(gen.destinationPath('test-bundle/package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('test-bundle/README.md'), 'foo');
				}.bind(this))
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			var pkg = _.extend({name: 'test-bundle'}, this.pkg);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous README.md', function () {
			assert.fileContent('README.md', 'foo');
		});
	});
});
