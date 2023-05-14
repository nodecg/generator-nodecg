import _ from 'lodash';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import {URL} from "url";

const __dirname = new URL('.', import.meta.url).pathname;

describe('nodecg:panel', () => {
	describe('running on new project', () => {
		describe('javascript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/panel'))
					.withPrompts({ name: 'test-panel', typescript: false, react: false })
					.on('error', done)
					.on('end', done);
			});

			it('creates files', () => {
				assert.file(['dashboard/test-panel.html']);
			});

			it('creates dashboard/test-panel.html', () => {
				assert.fileContent('dashboard/test-panel.html', '<script type="module" src="./test-panel.js">');
			});

			it('creates dashboard/test-panel.js', () => {
				assert.file('dashboard/test-panel.js');
			});

			it('creates package.json', () => {
				assert.file('package.json');
				assert.jsonFileContent('package.json', {
					nodecg: {
						dashboardPanels: [
							{
								name: 'test-panel',
								title: 'Test Panel',
								width: 2,
								file: 'test-panel.html',
								headerColor: '#525F78',
							},
						],
					},
				});
			});
		});

		describe('typescript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/panel'))
					.withPrompts({ name: 'test-panel', typescript: true, react: false })
					.on('error', done)
					.on('end', done);
			});

			it('creates dashboard/test-panel.html', () => {
				assert.fileContent(
					'src/dashboard/test-panel.html',
					'<script type="module" src="./test-panel.ts">',
				);
			});

			it('creates src/dashboard/test-panel.ts', () => {
				assert.file('src/dashboard/test-panel.ts');
			});
		});

		describe('react', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/panel'))
					.withPrompts({ name: 'test-panel', typescript: true, react: true })
					.on('error', done)
					.on('end', done);
			});

			it('creates src/dashboard/test-panel.html', () => {
				assert.fileContent(
					'src/dashboard/test-panel.html',
					'<script type="module" src="./test-panel-bootstrap.tsx">',
				);
			});

			it('creates src/dashboard/test-panel-bootstrap.tsx', () => {
				assert.fileContent('src/dashboard/test-panel-bootstrap.tsx', "import { TestPanel } from './TestPanel'");
				assert.fileContent('src/dashboard/test-panel-bootstrap.tsx', 'root.render(<TestPanel />);');
			});

			it('creates src/dashboard/TestPanel.tsx', () => {
				assert.fileContent('src/dashboard/TestPanel.tsx', 'export function TestPanel() {');
			});
		});
	});

	describe('specific features', () => {
		it('supports fullbleed panels', (done) => {
			void helpers
				.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({
					name: 'test-panel',
					fullbleed: true,
				})
				.on('error', done)
				.on('end', () => {
					assert.jsonFileContent('package.json', {
						nodecg: {
							dashboardPanels: [
								{
									name: 'test-panel',
									title: 'Test Panel',
									file: 'test-panel.html',
									headerColor: '#525F78',
									fullbleed: true,
								},
							],
						},
					});
					done();
				});
		});

		it('supports placing panels in custom workspaces', (done) => {
			void helpers
				.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({
					name: 'test-panel',
					workspace: true,
					workspaceName: 'custom',
				})
				.on('error', done)
				.on('end', () => {
					assert.jsonFileContent('package.json', {
						nodecg: {
							dashboardPanels: [
								{
									name: 'test-panel',
									title: 'Test Panel',
									file: 'test-panel.html',
									headerColor: '#525F78',
									width: 2,
									workspace: 'custom',
								},
							],
						},
					});
					done();
				});
		});
	});

	describe('running on existing project', () => {
		before(function (done) {
			this.pkg = {
				name: 'test-bundle',
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
				.run(path.join(__dirname, '../generators/panel'))
				.withPrompts({ name: 'test-panel' })
				.on('ready', (gen: any) => {
					gen.fs.writeJSON(gen.destinationPath('package.json'), this.pkg);
					gen.fs.write(gen.destinationPath('dashboard/test-panel.html'), 'foo');
				})
				.on('error', done)
				.on('end', done);
		});

		it('extends package.json keys with missing ones', function () {
			const pkg = _.extend(
				{
					nodecg: {
						dashboardPanels: [
							{
								name: 'test-panel',
								title: 'Test Panel',
								width: 2,
								file: 'test-panel.html',
								headerColor: '#525F78',
							},
						],
					},
				},
				this.pkg,
			);
			assert.jsonFileContent('package.json', pkg);
		});

		it('does not overwrite previous html file', () => {
			assert.fileContent('dashboard/test-panel.html', 'foo');
		});
	});
});
