import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

describe('nodecg:extension', () => {
	context('running on new project', () => {
		context('javascript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({ type: 'folder', typescript: false })
					.on('error', done)
					.on('end', done);
			});

			it('creates the file', () => {
				assert.file('extension/index.js');
			});
		});

		context('typescript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({ type: 'folder', typescript: true })
					.on('error', done)
					.on('end', done);
			});

			it('creates the file', () => {
				assert.file('src/extension/index.ts');
			});
		});
	});

	context('running on existing project', () => {
		context('javascript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({ type: 'folder', typescript: false })
					.on('ready', (gen: any) => {
						gen.fs.write(gen.destinationPath('extension/index.js'), 'foo');
					})
					.on('error', done)
					.on('end', done);
			});

			it('does not overwrite previous extension file', () => {
				assert.fileContent('extension/index.js', 'foo');
			});
		});

		context('typescript', () => {
			before((done) => {
				void helpers
					.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({ type: 'folder', typescript: false })
					.on('ready', (gen: any) => {
						gen.fs.write(gen.destinationPath('src/extension/index.ts'), 'foo');
					})
					.on('error', done)
					.on('end', done);
			});

			it('does not overwrite previous extension file', () => {
				assert.fileContent('src/extension/index.ts', 'foo');
			});
		});
	});
});
