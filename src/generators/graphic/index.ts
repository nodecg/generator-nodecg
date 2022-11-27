import Generator from 'yeoman-generator';
import extend from 'deep-extend';
import type { Manifest } from '../../types/manifest';

module.exports = class extends Generator {
	public props: {
		file?: string;
		width?: number;
		height?: number;
		singleInstance?: boolean;
	};

	constructor(args: string | string[], opts: Generator.GeneratorOptions) {
		super(args, opts);

		this.props = {};
	}

	async prompting() {
		const prompts: Generator.Questions = [
			{
				type: 'input',
				name: 'file',
				message: "Your graphic's file",
				default: 'index.html',
			},
			{
				type: 'input',
				name: 'width',
				message: "Your graphic's width (in pixels)",
				default: 1920,
				filter(input) {
					return parseInt(input, 10);
				},
				validate(input) {
					return input > 0;
				},
			},
			{
				type: 'input',
				name: 'height',
				message: "Your graphic's height (in pixels)",
				default: 1080,
				filter(input) {
					return parseInt(input, 10);
				},
				validate(input) {
					return input > 0;
				},
			},
			{
				type: 'confirm',
				name: 'singleInstance',
				message: 'Is this a "single instance" graphic?',
				default: false,
			},
		];

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	writing() {
		const html = this.fs.read(this.templatePath('graphic.html'));
		const graphicFilePath = this.destinationPath(`graphics/${this.props.file!}`);
		if (!this.fs.exists(graphicFilePath)) {
			this.fs.write(graphicFilePath, html);
		}

		const graphicProps = {
			file: this.props.file!,
			width: this.props.width!,
			height: this.props.height!,
			singleInstance: false,
		};

		if (this.props.singleInstance) {
			graphicProps.singleInstance = this.props.singleInstance;
		}

		// Re-read the content at this point because a composed generator might modify it.
		const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {}) as unknown as Manifest;
		currentPkg.nodecg = currentPkg.nodecg ?? {};
		currentPkg.nodecg.graphics = currentPkg.nodecg.graphics ?? [];
		currentPkg.nodecg.graphics.push(graphicProps);

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
	}
};
