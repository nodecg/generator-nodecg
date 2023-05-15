import Generator from 'yeoman-generator';
import extend from 'deep-extend';
import _, { camelCase, upperFirst } from 'lodash-es';
import type { Manifest, UnparsedPanel } from '../../types/manifest';
import path from 'path';

export default class PanelGenerator extends Generator {
	public props: {
		name?: string;
		title?: string;
		width?: number;
		fullbleed?: boolean;
		workspace?: boolean;
		workspaceName?: string;
		dialog?: boolean;
		dialogConfirmBtn?: boolean;
		dialogDismissBtn?: boolean;
		dialogConfirmBtnLabel?: string;
		dialogDismissBtnLabel?: string;
		headerColor?: string;
		typescript?: boolean;
		react?: boolean;
	};

	constructor(args: string | string[], opts: Generator.GeneratorOptions) {
		super(args, opts);

		this.props = {
			typescript: opts.typescript,
			react: opts.react,
		};
	}

	async prompting() {
		await this._askForPanelName();
		await this._askFor();
	}

	// Begin by asking for just the panel name.
	// This will be used to supply the default panel title.
	async _askForPanelName() {
		const prompts: Generator.Questions = [
			{
				type: 'input',
				name: 'name',
				message: "Your panel's name",
				default: 'panel',
				filter: _.kebabCase,
				validate(input) {
					return input && input.length > 0;
				},
			},
		];

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	async _askFor() {
		const prompts: Generator.Questions = [
			{
				type: 'input',
				name: 'title',
				message: "Your panel's title",
				default: _.startCase(this.props.name),
				validate(input) {
					return input && input.length > 0;
				},
			},
			{
				type: 'confirm',
				name: 'fullbleed',
				message: 'Is this a fullbleed panel?',
				default: false,
			},
			{
				type: 'input',
				name: 'width',
				message:
					'How many width units (1-8) should your panel be? (Actual size in px: [144*n - 16] with n being the entered width unit)',
				default: 2,
				when(answers) {
					return !answers.fullbleed;
				},
				filter(input: string) {
					return parseInt(input, 10);
				},
				validate(input) {
					return input > 0 && input <= 8;
				},
			},
			{
				type: 'confirm',
				name: 'dialog',
				message: 'Is this panel a pop-up dialog?',
				default: false,
				when(answers) {
					return !answers.fullbleed;
				},
			},
			{
				type: 'input',
				name: 'headerColor',
				message: "What hex color would you like your panel's header to be?",
				default: '#525F78',
				when(answers) {
					return !answers.dialog;
				},
			},
			{
				type: 'confirm',
				name: 'dialogConfirmBtn',
				message: 'Should this dialog have a "confirm" button?',
				default: true,
				when(answers) {
					return answers.dialog;
				},
			},
			{
				type: 'input',
				name: 'dialogConfirmBtnLabel',
				message: 'What should the "confirm" button\'s label be?',
				default: 'Confirm',
				when(answers) {
					return answers.dialogConfirmBtn;
				},
			},
			{
				type: 'confirm',
				name: 'dialogDismissBtn',
				message: 'Should this dialog have a "dismiss" button?',
				default: true,
				when(answers) {
					return answers.dialog;
				},
			},
			{
				type: 'input',
				name: 'dialogDismissBtnLabel',
				message: 'What should the "dismiss" button\'s label be?',
				default: 'Dismiss',
				when(answers) {
					return answers.dialogDismissBtn;
				},
			},
			{
				type: 'confirm',
				name: 'workspace',
				message: 'Would you like to put this panel in custom workspace?',
				default: false,
				when(answers) {
					return !answers.fullbleed;
				},
			},
			{
				type: 'input',
				name: 'workspaceName',
				message: 'What name of the workspace would you like to put this panel in?',
				when(answers) {
					return !answers.fullbleed && answers.workspace;
				},
			},
			// Only prompt for typescript if a parent generator didn't already do so
			{
				name: 'typescript',
				message: 'Would you like to generate this panel in TypeScript?',
				type: 'confirm',
				when: () => typeof this.props.typescript === 'undefined',
			},
			{
				name: 'react',
				message: 'Would you like to generate this panel in React?',
				type: 'confirm',
				when: (answers) =>
					(this.props.typescript ?? answers.typescript) && typeof this.props.react === 'undefined',
			},
		];

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	writing() {
		// Populate and write the graphic template
		const htmlFileName = this.props.typescript
			? `src/dashboard/${this.props.name!}.html`
			: `dashboard/${this.props.name!}.html`;
		if (!this.fs.exists(this.destinationPath(htmlFileName))) {
			const fileNameNoExt = path.basename(htmlFileName, path.extname(htmlFileName));
			if (this.props.react) {
				const bootstrapScriptName = `${fileNameNoExt}-bootstrap.tsx`;
				const elementName = upperFirst(camelCase(fileNameNoExt));
				this.fs.copyTpl(this.templatePath('react/panel.html'), this.destinationPath(htmlFileName), {
					scriptName: bootstrapScriptName,
				});
				this.fs.copyTpl(
					this.templatePath('react/panel.tsx'),
					this.destinationPath(`src/dashboard/${bootstrapScriptName}`),
					{
						elementName,
					},
				);
				this.fs.copyTpl(
					this.templatePath('react/Element.tsx'),
					this.destinationPath(`src/dashboard/${elementName}.tsx`),
					{
						elementName,
					},
				);
			} else {
				this.fs.copyTpl(this.templatePath('vanilla/panel.html'), this.destinationPath(htmlFileName), {
					scriptName: `${fileNameNoExt}.${this.props.typescript ? 'ts' : 'js'}`,
					typescript: this.props.typescript,
				});
				this.fs.copy(
					this.templatePath(this.props.typescript ? 'vanilla/panel.ts' : 'vanilla/panel.js'),
					this.destinationPath(
						this.props.typescript ? `src/dashboard/${fileNameNoExt}.ts` : `dashboard/${fileNameNoExt}.js`,
					),
				);
			}
		}

		const panelProps: UnparsedPanel = {
			name: this.props.name!,
			title: this.props.title!,
			width: this.props.width,
			file: `${this.props.name!}.html`,
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
				panelProps.dialogButtons = panelProps.dialogButtons ?? [];
				panelProps.dialogButtons.push({
					name: this.props.dialogConfirmBtnLabel!,
					type: 'confirm',
				});
			}

			if (this.props.dialogDismissBtn) {
				panelProps.dialogButtons = panelProps.dialogButtons ?? [];
				panelProps.dialogButtons.push({
					name: this.props.dialogDismissBtnLabel!,
					type: 'dismiss',
				});
			}
		} else {
			panelProps.headerColor = this.props.headerColor;
		}

		// Re-read the content at this point because a composed generator might modify it.
		const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {}) as unknown as Manifest;
		currentPkg.nodecg = currentPkg.nodecg ?? {};
		currentPkg.nodecg.dashboardPanels = currentPkg.nodecg.dashboardPanels ?? [];
		currentPkg.nodecg.dashboardPanels.push(panelProps);

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
	}
}
