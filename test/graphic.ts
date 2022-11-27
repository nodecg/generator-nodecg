import _ from 'lodash';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('nodecg:graphic', () => {
	describe('running on new project', () => {
		before((done) => {
			void helpers
				.run(path.join(__dirname, '../generators/graphic'))
				.withPrompts({
					file: 'index.html',
					width: 1280,
					height: 720,
					singleInstance: false,
				})
				.on('error', done)
				.on('end', done);
		});

		it('creates files', () => {
			assert.file(['graphics/index.html']);
		});

		it('creates package.json', () => {
			assert.file('package.json');
			assert.jsonFileContent('package.json', {
				nodecg: {
					graphics: [
						{
							file: 'index.html',
							width: 1280,
							height: 720,
						},
					],
				},
			});
		});
	});

	describe('running on existing project', () => {
		before(function (done) {
			this.pkg = {
				name: 'test-bundle',
				version: '1.0.34',
				description: 'lots of fun',
				homepage: 'http://nodecg.com',
				repository: 'nodecg/test-bundle',
				author: 'Alex Van Camp',
				files: ['dashboard', 'graphics', 'extension.js', 'extension'],
				keywords: ['bar', 'nodecg-bundle'],
				nodecg: {
					compatibleRange: '~0.7.0',
				},
			};
			void helpers
				.run(path.join(__dirname, '../generators/graphic'))
				.withPrompts({
					file: 'index.html',
					width: 1280,
					height: 720,
					singleInstance: false,
				})
				.on('ready', (gen: any) => {
					gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('graphics/index.html'), 'foo');
				})
				.on('error', done)
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend(
				{
					nodecg: {
						graphics: [
							{
								file: 'index.html',
								width: 1280,
								height: 720,
							},
						],
					},
				},
				this.pkg,
			);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous html file', () => {
			assert.fileContent('graphics/index.html', 'foo');
		});
	});
});
