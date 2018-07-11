'use strict';

const Generator = require('yeoman-generator');
const extend = require('deep-extend');
const _ = require('lodash');

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts);

		this.props = {};
	}

	prompting() {
		return this._askForPanelName().then(() => this._askFor());
	}

	// Begin by asking for just the panel name.
	// This will be used to supply the default panel title.
	_askForPanelName() {
		const prompts = [{
			type: 'input',
			name: 'name',
			message: 'Your panel\'s name',
			filter: _.kebabCase
		}];

		return this.prompt(prompts).then(props => {
			this.props = extend(this.props, props);
		});
	}

	_askFor() {
		const prompts = [{
			type: 'input',
			name: 'title',
			message: 'Your panel\'s title',
			default: _.startCase(this.props.name)
		}, {
			type: 'confirm',
			name: 'fullbleed',
			message: 'Is this a fullbleed panel?',
			default: false
		}, {
			type: 'input',
			name: 'width',
			message: 'How many width units (1-8) should your panel be?',
			default: 2,
			when(answers) {
				return !answers.fullbleed;
			},
			filter(input) {
				return parseInt(input, 10);
			},
			validate(input) {
				return input > 0 && input <= 8;
			}
		}, {
			type: 'confirm',
			name: 'dialog',
			message: 'Is this panel a pop-up dialog?',
			default: false,
			when(answers) {
				return !answers.fullbleed;
			}
		}, {
			type: 'input',
			name: 'headerColor',
			message: 'What hex color would you like your panel\'s header to be?',
			default: '#9f9bbd',
			when(answers) {
				return !answers.dialog;
			}
		}, {
			type: 'confirm',
			name: 'dialogConfirmBtn',
			message: 'Should this dialog have a "confirm" button?',
			default: true,
			when(answers) {
				return answers.dialog;
			}
		}, {
			type: 'input',
			name: 'dialogConfirmBtnLabel',
			message: 'What should the "confirm" button\'s label be?',
			default: 'Confirm',
			when(answers) {
				return answers.dialogConfirmBtn;
			}
		}, {
			type: 'confirm',
			name: 'dialogDismissBtn',
			message: 'Should this dialog have a "dismiss" button?',
			default: true,
			when(answers) {
				return answers.dialog;
			}
		}, {
			type: 'input',
			name: 'dialogDismissBtnLabel',
			message: 'What should the "dismiss" button\'s label be?',
			default: 'Dismiss',
			when(answers) {
				return answers.dialogDismissBtn;
			}
		}, {
			type: 'confirm',
			name: 'workspace',
			message: 'Would you like to put this panel in custom workspace?',
			default: false,
			when(answers) {
				return !answers.fullbleed;
			}
		}, {
			type: 'input',
			name: 'workspaceName',
			message: 'What name of the workspace would you like to put this panel in?',
			when(answers) {
				return !answers.fullbleed && answers.workspace;
			}
		}];

		return this.prompt(prompts).then(props => {
			this.props = extend(this.props, props);
		});
	}

	writing() {
		const html = this.fs.read(this.templatePath('panel.html'));
		const panelFilePath = this.destinationPath('dashboard/' + this.props.name + '.html');
		if (!this.fs.exists(panelFilePath)) {
			this.fs.write(panelFilePath, html);
		}

		const panelProps = {
			name: this.props.name,
			title: this.props.title,
			width: this.props.width,
			file: this.props.name + '.html'
		};

		if (this.props.fullbleed) {
			panelProps.fullbleed = true;
		}

		if (this.props.workspace) {
			panelProps.workspace = this.props.workspaceName;
		}

		if (this.props.dialog) {
			panelProps.dialog = this.props.dialog;

			if (this.props.dialogConfirmBtn) {
				panelProps.dialogButtons = panelProps.dialogButtons || [];
				panelProps.dialogButtons.push({
					name: this.props.dialogConfirmBtnLabel,
					type: 'confirm'
				});
			}

			if (this.props.dialogDismissBtn) {
				panelProps.dialogButtons = panelProps.dialogButtons || [];
				panelProps.dialogButtons.push({
					name: this.props.dialogDismissBtnLabel,
					type: 'dismiss'
				});
			}
		} else {
			panelProps.headerColor = this.props.headerColor;
		}

		// Re-read the content at this point because a composed generator might modify it.
		const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
		currentPkg.nodecg = currentPkg.nodecg || {};
		currentPkg.nodecg.dashboardPanels = currentPkg.nodecg.dashboardPanels || [];
		currentPkg.nodecg.dashboardPanels.push(panelProps);

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
	}
};
