'use strict';

var yeoman = require('yeoman-generator');
var extend = require('deep-extend');

module.exports = yeoman.Base.extend({
	initializing: function () {
		this.props = {};
	},

	prompting: {
		askFor: function () {
			var done = this.async();

			var prompts = [{
				type: 'list',
				name: 'type',
				message: 'How should your extension be organized?',
				choices: [{
					name: 'In one file (extension.js)',
					value: 'file',
					short: 'file'
				}, {
					name: 'In a folder (extension/index.js)',
					value: 'folder',
					short: 'folder'
				}],
				default: 'file'
			}];

			this.prompt(prompts, function (props) {
				this.props = extend(this.props, props);
				done();
			}.bind(this));
		}
	},

	writing: function () {
		// If this bundle already has an extension, do nothing.
		if (this.fs.exists(this.destinationPath('extension.js'))
			|| this.fs.exists(this.destinationPath('extension/index.js'))) {
			return;
		}

		var js = this.fs.read(this.templatePath('extension.js'));

		if (this.props.type === 'file') {
			this.fs.write(this.destinationPath('extension.js'), js);
		} else {
			this.fs.write(this.destinationPath('extension/index.js'), js);
		}
	}
});
