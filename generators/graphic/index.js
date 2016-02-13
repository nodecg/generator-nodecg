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
				type: 'input',
				name: 'file',
				message: 'Your graphic\'s file',
				default: 'index.html'
			}, {
				type: 'input',
				name: 'width',
				message: 'Your graphic\'s width (in pixels)',
				default: 1280,
				filter: function (input) {
					return parseInt(input, 10);
				},
				validate: function (input) {
					return input > 0;
				}
			}, {
				type: 'input',
				name: 'height',
				message: 'Your graphic\'s height (in pixels)',
				default: 720,
				filter: function (input) {
					return parseInt(input, 10);
				},
				validate: function (input) {
					return input > 0;
				}
			}, {
				type: 'confirm',
				name: 'singleInstance',
				message: 'Is this a "single instance" graphic?',
				default: false
			}];

			this.prompt(prompts, function (props) {
				this.props = extend(this.props, props);
				done();
			}.bind(this));
		}
	},

	writing: function () {
		var html = this.fs.read(this.templatePath('graphic.html'));
		var graphicFilePath = this.destinationPath('graphics/' + this.props.file);
		if (!this.fs.exists(graphicFilePath)) {
			this.fs.write(graphicFilePath, html);
		}

		var graphicProps = {
			file: this.props.file,
			width: this.props.width,
			height: this.props.height
		};

		if (this.props.singleInstance) {
			graphicProps.singleInstance = this.props.singleInstance;
		}

		// Re-read the content at this point because a composed generator might modify it.
		var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
		currentPkg.nodecg = currentPkg.nodecg || {};
		currentPkg.nodecg.graphics = currentPkg.nodecg.graphics || [];
		currentPkg.nodecg.graphics.push(graphicProps);

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
	}
});
