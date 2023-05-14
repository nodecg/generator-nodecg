import _ from 'lodash';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import {URL} from "url";

const __dirname = new URL('.', import.meta.url).pathname;

describe('nodecg:graphic', () => {
	describe('running on new project', () => {
		context('javascript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/graphic'))
					.withPrompts({
						file: 'index.html',
						width: 1280,
						height: 720,
						singleInstance: false,
						typescript: false,
						react: false,
					})
					.on('error', done)
					.on('end', done);
			});

			it('creates graphics/index.html', () => {
				assert.fileContent('graphics/index.html', '<script type="module" src="./index.js">');
			});

			it('creates graphics/index.js', () => {
				assert.file('graphics/index.js');
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

		context('typescript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/graphic'))
					.withPrompts({
						file: 'index.html',
						width: 1280,
						height: 720,
						singleInstance: false,
						typescript: true,
						react: false,
					})
					.on('error', done)
					.on('end', done);
			});

			it('creates src/graphics/index.html', () => {
				assert.fileContent('src/graphics/index.html', '<script type="module" src="./index.ts">');
			});

			it('creates src/graphics/index.ts', () => {
				assert.file('src/graphics/index.ts');
			});
		});

		context('react', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/graphic'))
					.withPrompts({
						file: 'index.html',
						width: 1280,
						height: 720,
						singleInstance: false,
						typescript: true,
						react: true,
					})
					.on('error', done)
					.on('end', done);
			});

			it('creates src/graphics/index.html', () => {
				assert.fileContent('src/graphics/index.html', '<script type="module" src="./index-bootstrap.tsx">');
			});

			it('creates src/graphics/index-bootstrap.tsx', () => {
				assert.fileContent('src/graphics/index-bootstrap.tsx', "import { Index } from './Index'");
				assert.fileContent('src/graphics/index-bootstrap.tsx', 'root.render(<Index />);');
			});

			it('creates src/graphics/Index.tsx', () => {
				assert.fileContent('src/graphics/Index.tsx', 'export function Index() {');
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
					typescript: false,
					react: false,
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
