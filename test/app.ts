import _ from 'lodash';
import mockery from 'mockery';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('nodecg:app', () => {
	before(async () => {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false,
		});
		mockery.registerMock(
			'npm-name',
			async () =>
				new Promise((resolve) => {
					resolve(true);
				}),
		);
		mockery.registerMock('github-username', async () => Promise.resolve('unicornUser'));
		mockery.registerMock(require.resolve('generator-license'), helpers.createDummyGenerator());
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
				homepage: 'http://nodecg.dev',
				githubAccount: 'nodecg',
				authorName: 'Alex Van Camp',
				authorEmail: 'email@alexvan.camp',
				authorUrl: 'http://alexvan.camp/',
				keywords: ['foo', 'bar'],
				typescript: false,
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers)
				.on('error', done)
				.on('end', done);
		});

		it('creates files', () => {
			assert.file(['test-bundle/README.md']);
		});

		it('creates package.json', function () {
			assert.file('test-bundle/package.json');
			assert.jsonFileContent('test-bundle/package.json', {
				name: 'test-bundle',
				version: '0.0.0',
				description: this.answers.description,
				homepage: this.answers.homepage,
				author: {
					name: this.answers.authorName,
					email: this.answers.authorEmail,
					url: this.answers.authorUrl,
				},
				files: ['dashboard', 'graphics', 'extension.js', 'extension'],
				keywords: ['foo', 'bar', 'nodecg-bundle'],
				nodecg: {
					compatibleRange: '^2.0.0',
				},
			});
		});

		it('creates and fill contents in README.md', () => {
			assert.file('test-bundle/README.md');
			assert.fileContent(
				'test-bundle/README.md',
				'test-bundle is a [NodeCG](http://github.com/nodecg/nodecg) bundle.',
			);
		});
	});

	describe('running on existing project', () => {
		before(function (done) {
			this.pkg = {
				version: '1.0.34',
				description: 'lots of fun',
				homepage: 'http://nodecg.dev',
				repository: 'nodecg/test-bundle',
				author: 'Alex Van Camp',
				files: ['dashboard', 'graphics', 'extension.js', 'extension'],
				keywords: ['bar', 'nodecg-bundle'],
				nodecg: {
					compatibleRange: '~0.7.0',
				},
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts({
					name: 'test-bundle',
					typescript: false,
				})
				.on('ready', (gen: any) => {
					gen.fs.writeJSON(gen.destinationPath('test-bundle/package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('test-bundle/README.md'), 'foo');
				})
				.on('error', done)
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend({ name: 'test-bundle' }, this.pkg);
			assert.jsonFileContent('test-bundle/package.json', pkg);
		});

		it('does not overwrite previous README.md', () => {
			assert.fileContent('test-bundle/README.md', 'foo');
		});
	});

	describe('adding typescript', () => {
		before(function (done) {
			this.timeout(10000);
			this.answers = {
				name: 'typescript-bundle',
				typescript: true,
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers)
				.on('error', done)
				.on('end', done);
		});

		it('writes tsconfigs', () => {
			assert.file('typescript-bundle/tsconfig.json');
			assert.file('typescript-bundle/tsconfig.build.json');
			assert.file('typescript-bundle/src/dashboard/tsconfig.json');
			assert.file('typescript-bundle/src/graphics/tsconfig.json');
			assert.file('typescript-bundle/src/extension/tsconfig.json');
		});

		it('writes scripts', () => {
			assert.file('typescript-bundle/scripts/build.mjs');
		});

		it('writes .parcelrc', () => {
			assert.file('typescript-bundle/.parcelrc');
		});

		it('adds dependencies to package.json', () => {
			assert.fileContent('typescript-bundle/package.json', '"ts-node"');
			assert.fileContent('typescript-bundle/package.json', '"typescript"');
			assert.fileContent('typescript-bundle/package.json', '"@types/node"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/core"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/config-default"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/reporter-cli"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/validator-typescript"');
			assert.fileContent('typescript-bundle/package.json', '"glob"');
			assert.fileContent('typescript-bundle/package.json', '"json-schema-to-typescript"');
			assert.fileContent('typescript-bundle/package.json', '"trash-cli"');
		});

		it('adds build scripts to package.json', () => {
			assert.fileContent('typescript-bundle/package.json', '"build": "node scripts/build.mjs"');
			assert.fileContent('typescript-bundle/package.json', '"watch": "node scripts/build.mjs --watch"');
			assert.fileContent(
				'typescript-bundle/package.json',
				'"generate-schema-types": "trash src/types/schemas && nodecg schema-types"',
			);
		});
	});
});
