'use strict';
var _ = require('lodash');
var mockery = require('mockery');
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('nodecg:extension', function () {
	context('running on new project', function () {
		context('in file mode', function () {
			before(function (done) {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'file'})
					.on('end', done);
			});

			it('creates the file', function () {
				assert.file('extension.js');
			});
		});

		context('in folder mode', function () {
			before(function (done) {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'folder'})
					.on('end', done);
			});

			it('creates the file', function () {
				assert.file('extension/index.js');
			});
		});
	});

	context('running on existing project', function () {
		context('in file mode', function () {
			before(function (done) {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'file'})
					.on('ready', function (gen) {
						gen.fs.write(gen.destinationPath('extension.js'), 'foo');
					}.bind(this))
					.on('end', done);
			});

			it('does not overwrite previous extension file', function () {
				assert.fileContent('extension.js', 'foo');
			});
		});

		context('in folder mode', function () {
			before(function (done) {
				helpers.run(path.join(__dirname, '../generators/extension'))
					.withPrompts({type: 'folder'})
					.on('ready', function (gen) {
						gen.fs.write(gen.destinationPath('extension/index.js'), 'foo');
					}.bind(this))
					.on('end', done);
			});

			it('does not overwrite previous extension file', function () {
				assert.fileContent('extension/index.js', 'foo');
			});
		});
	});
});
