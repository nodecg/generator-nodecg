import _ from 'lodash';
import mockery from 'mockery';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { URL } from 'url';
import { createRequire } from 'node:module';
import type Generator from 'yeoman-generator';
import { promisify } from 'util';
import { exec } from 'child_process';

const require = createRequire(import.meta.url);

// Will contain trailing slash
const __dirname = new URL('.', import.meta.url).pathname;

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
				react: false,
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers as Generator.Answers)
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
					react: false,
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

	describe('typescript', () => {
		before(function (done) {
			this.timeout(10000);
			this.answers = {
				name: 'typescript-bundle',
				typescript: true,
				react: false,
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers as Generator.Answers)
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

		it('writes nodemon.json', () => {
			assert.file('typescript-bundle/nodemon.json');
		});

		it('writes replicant schema(s)', () => {
			assert.file('typescript-bundle/schemas/exampleReplicant.json');
			assert.file('typescript-bundle/src/types/schemas/index.d.ts');
			assert.file('typescript-bundle/src/types/schemas/exampleReplicant.d.ts');
		});

		it('adds dependencies to package.json', () => {
			assert.fileContent('typescript-bundle/package.json', '"ts-node"');
			assert.fileContent('typescript-bundle/package.json', '"typescript"');
			assert.fileContent('typescript-bundle/package.json', '"@types/node"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/core"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/config-default"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/reporter-cli"');
			assert.fileContent('typescript-bundle/package.json', '"@parcel/validator-typescript"');
			assert.fileContent('typescript-bundle/package.json', '"@nodecg/types"');
			assert.fileContent('typescript-bundle/package.json', '"glob"');
			assert.fileContent('typescript-bundle/package.json', '"trash-cli"');
			assert.fileContent('typescript-bundle/package.json', '"nodemon"');
			assert.fileContent('typescript-bundle/package.json', '"concurrently"');
		});

		it('adds build scripts to package.json', () => {
			assert.fileContent('typescript-bundle/package.json', '"build": "node scripts/build.mjs"');
			assert.fileContent(
				'typescript-bundle/package.json',
				'"build:extension": "node scripts/build.mjs --skipBrowser"',
			);
			assert.fileContent('typescript-bundle/package.json', '"watch": "node scripts/build.mjs --watch"');
			assert.fileContent(
				'typescript-bundle/package.json',
				'"watch:browser": "node scripts/build.mjs --skipExtension --watch"',
			);
			assert.fileContent(
				'typescript-bundle/package.json',
				`"dev": "concurrently --kill-others \\"npm run watch:browser\\" \\"nodemon\\""`,
			);
			assert.fileContent(
				'typescript-bundle/package.json',
				'"generate-schema-types": "trash src/types/schemas && nodecg schema-types"',
			);
		});

		it('generates an actually buildable bundle', async function () {
			// Increase timeout because npm install (and build) can take some time...
			this.timeout(130000);
			await checkBuild();
		});
	});

	describe('react', () => {
		before(function (done) {
			this.timeout(20000);
			this.answers = {
				name: 'react-bundle',
				typescript: true,
				react: true,
			};
			void helpers
				.run(path.join(__dirname, '../generators/app'))
				.withPrompts(this.answers as Generator.Answers)
				.on('error', done)
				.on('end', done);
		});

		it('adds dependencies to package.json', () => {
			assert.fileContent('react-bundle/package.json', '"react"');
			assert.fileContent('react-bundle/package.json', '"react-dom"');
			assert.fileContent('react-bundle/package.json', '"@types/react"');
			assert.fileContent('react-bundle/package.json', '"@types/react-dom"');
		});
	});
});

async function checkBuild(): Promise<void> {
	// Get the temporary directory path yeoman is running the generator into (on linux usually: /tmp/<randomString>)
	const context = process.cwd();

	const command = 'npm install && npm run build';
	const executionPath: string = path.join(context, 'typescript-bundle');

	console.debug('building environment: ', context, command, executionPath);

	// Execute the build command in a subprocess
	const { stdout, stderr } = await promisify(exec)(command, { cwd: executionPath });

	console.log('stdout: ', stdout);
	console.error('stderr: ', stderr);

	// Check the result (would in fact even without this success message, when subprocess does not exit with code 0 -> but just in case check anyways
	assert.strictEqual(stdout.includes('Bundle build completed successfully'), true, 'Expected success message');
}
