'use strict';
const _ = require('lodash');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('nodecg:graphic', () => {
	describe('running on new project', () => {
		before(done => {
			helpers.run(path.join(__dirname, '../generators/graphic'))
				.withPrompts({
					file: 'index.html',
					width: 1280,
					height: 720,
					singleInstance: false
				})
				.on('end', done);
		});

		it('creates files', () => {
			assert.file([
				'graphics/index.html'
			]);
		});

		it('creates package.json', () => {
			assert.file('package.json');
			assert.jsonFileContent('package.json', {
				nodecg: {
					graphics: [{
						file: 'index.html',
						width: 1280,
						height: 720
					}]
				}
			});
		});
	});

	describe('running on existing project', () => {
		before(done => {
			this.pkg = {
				name: 'test-bundle',
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
			helpers.run(path.join(__dirname, '../generators/graphic'))
				.withPrompts({
					file: 'index.html',
					width: 1280,
					height: 720,
					singleInstance: false
				})
				.on('ready', gen => {
					gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('graphics/index.html'), 'foo');
				})
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend({
				nodecg: {
					graphics: [{
						file: 'index.html',
						width: 1280,
						height: 720
					}]
				}
			}, this.pkg);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous html file', () => {
			assert.fileContent('graphics/index.html', 'foo');
		});
	});
});
