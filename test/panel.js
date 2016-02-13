'use strict';
var _ = require('lodash');
var mockery = require('mockery');
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('nodecg:panel', function () {
	describe('running on new project', function () {
		before(function (done) {
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({name: 'test-panel'})
				.on('end', done);
		});

		it('creates files', function () {
			assert.file([
				'dashboard/test-panel.html'
			]);
		});

		it('creates package.json', function () {
			assert.file('package.json');
			assert.jsonFileContent('package.json', {
				nodecg: {
					dashboardPanels: [{
						name: 'test-panel',
						title: 'Test Panel',
						width: 2,
						file: 'test-panel.html',
						headerColor: '#9f9bbd'
					}]
				}
			});
		});
	});

	describe('running on existing project', function () {
		before(function (done) {
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
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({name: 'test-panel'})
				.on('ready', function (gen) {
					gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('dashboard/test-panel.html'), 'foo');
				}.bind(this))
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			var pkg = _.extend({
				nodecg: {
					dashboardPanels: [{
						name: 'test-panel',
						title: 'Test Panel',
						width: 2,
						file: 'test-panel.html',
						headerColor: '#9f9bbd'
					}]
				}
			}, this.pkg);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous html file', function () {
			assert.fileContent('dashboard/test-panel.html', 'foo');
		});
	});
});
