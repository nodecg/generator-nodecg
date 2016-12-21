'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('nodecg:extension', () => {
	context('running on new project', () => {
		context('in file mode', () => {
			before(done => {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'file'})
					.on('end', done);
			});

			it('creates the file', () => {
				assert.file('extension.js');
			});
		});

		context('in folder mode', () => {
			before(done => {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'folder'})
					.on('end', done);
			});

			it('creates the file', () => {
				assert.file('extension/index.js');
			});
		});
	});

	context('running on existing project', () => {
		context('in file mode', () => {
			before(done => {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'file'})
					.on('ready', gen => {
						gen.fs.write(gen.destinationPath('extension.js'), 'foo');
					})
					.on('end', done);
			});

			it('does not overwrite previous extension file', () => {
				assert.fileContent('extension.js', 'foo');
			});
		});

		context('in folder mode', () => {
			before(done => {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'folder'})
					.on('ready', gen => {
						gen.fs.write(gen.destinationPath('extension/index.js'), 'foo');
					})
					.on('end', done);
			});

			it('does not overwrite previous extension file', () => {
				assert.fileContent('extension/index.js', 'foo');
			});
		});
	});
});
