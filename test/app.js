'use strict';
const _ = require('lodash');
const mockery = require('mockery');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('nodecg:app', () => {
	before(() => {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});

		mockery.registerMock('npm-name', () => {
			return new Promise(resolve => {
				resolve(true);
			});
		});

		mockery.registerMock('github-username', (name, cb) => {
			cb(null, 'unicornUser');
		});

		mockery.registerMock(
			require.resolve('generator-license'),
			helpers.createDummyGenerator()
		);
	});

	after(() => {
		mockery.disable();
	});

	describe('running on new project', () => {
		before(function (done) {
			this.timeout(10000);
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

		it('creates files', () => {
			assert.file(['README.md']);
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
					compatibleRange: '~0.8.0'
				}
			});
		});

		it('creates and fill contents in README.md', () => {
			assert.file('README.md');
			assert.fileContent('README.md', 'test-bundle is a [NodeCG](http://github.com/nodecg/nodecg) bundle.');
		});
	});

	describe('running on existing project', () => {
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
				.on('ready', gen => {
					gen.fs.writeJSON(gen.destinationPath('test-bundle/package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('test-bundle/README.md'), 'foo');
				})
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend({name: 'test-bundle'}, this.pkg);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous README.md', () => {
			assert.fileContent('README.md', 'foo');
		});
	});
});
