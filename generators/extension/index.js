'use strict';

const Generator = require('yeoman-generator');
const extend = require('deep-extend');

module.exports = Generator.extend({
	initializing() {
		this.props = {};
	},

	prompting: {
		askFor() {
			const done = this.async();

			const prompts = [{
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

			this.prompt(prompts).then(props => {
				this.props = extend(this.props, props);
				done();
			});
		}
	},

	writing() {
		// If this bundle already has an extension, do nothing.
		if (this.fs.exists(this.destinationPath('extension.js')) ||
			this.fs.exists(this.destinationPath('extension/index.js'))) {
			return;
		}

		const js = this.fs.read(this.templatePath('extension.js'));

		if (this.props.type === 'file') {
			this.fs.write(this.destinationPath('extension.js'), js);
		} else {
			this.fs.write(this.destinationPath('extension/index.js'), js);
		}
	}
});
