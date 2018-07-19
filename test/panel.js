'use strict';
const _ = require('lodash');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('nodecg:panel', () => {
	describe('running on new project', () => {
		before(done => {
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({name: 'test-panel'})
				.on('end', done);
		});

		it('creates files', () => {
			assert.file([
				'dashboard/test-panel.html'
			]);
		});

		it('creates package.json', () => {
			assert.file('package.json');
			assert.jsonFileContent('package.json', {
				nodecg: {
					dashboardPanels: [{
						name: 'test-panel',
						title: 'Test Panel',
						width: 2,
						file: 'test-panel.html',
						headerColor: '#525F78'
					}]
				}
			});
		});
	});

	describe('specific features', () => {
		it('supports fullbleed panels', done => {
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({
					name: 'test-panel',
					fullbleed: true
				})
				.on('end', () => {
					assert.jsonFileContent('package.json', {
						nodecg: {
							dashboardPanels: [{
								name: 'test-panel',
								title: 'Test Panel',
								file: 'test-panel.html',
								headerColor: '#525F78',
								fullbleed: true
							}]
						}
					});
					done();
				});
		});

		it('supports placing panels in custom workspaces', done => {
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({
					name: 'test-panel',
					workspace: true,
					workspaceName: 'custom'
				})
				.on('end', () => {
					assert.jsonFileContent('package.json', {
						nodecg: {
							dashboardPanels: [{
								name: 'test-panel',
								title: 'Test Panel',
								file: 'test-panel.html',
								headerColor: '#525F78',
								width: 2,
								workspace: 'custom'
							}]
						}
					});
					done();
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
			helpers.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({name: 'test-panel'})
				.on('ready', gen => {
					gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('dashboard/test-panel.html'), 'foo');
				})
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend({
				nodecg: {
					dashboardPanels: [{
						name: 'test-panel',
						title: 'Test Panel',
						width: 2,
						file: 'test-panel.html',
						headerColor: '#525F78'
					}]
				}
			}, this.pkg);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous html file', () => {
			assert.fileContent('dashboard/test-panel.html', 'foo');
		});
	});
});
