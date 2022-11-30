import Generator from 'yeoman-generator';
import extend from 'deep-extend';
import type { Manifest } from '../../types/manifest';
import path from 'path';
import { camelCase, upperFirst } from 'lodash';

module.exports = class extends Generator {
	public props: {
		file?: string;
		width?: number;
		height?: number;
		singleInstance?: boolean;
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
			{
				// Only prompt for typescript if a parent generator didn't already do so
				name: 'typescript',
				message: 'Would you like to generate this graphic in TypeScript?',
				type: 'confirm',
				when: () => typeof this.props.typescript === 'undefined',
			},
			{
				name: 'react',
				message: 'Would you like to generate this graphic in React?',
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
			? `src/graphics/${this.props.file!}`
			: `graphics/${this.props.file!}`;
		if (!this.fs.exists(this.destinationPath(htmlFileName))) {
			const fileNameNoExt = path.basename(htmlFileName, path.extname(this.props.file!));
			if (this.props.react) {
				const bootstrapScriptName = `${fileNameNoExt}-bootstrap.tsx`;
				const elementName = upperFirst(camelCase(fileNameNoExt));
				this.fs.copyTpl(this.templatePath('react/graphic.html'), this.destinationPath(htmlFileName), {
					scriptName: bootstrapScriptName,
				});
				this.fs.copyTpl(
					this.templatePath('react/graphic.tsx'),
					this.destinationPath(`src/graphics/${bootstrapScriptName}`),
					{
						elementName,
					},
				);
				this.fs.copyTpl(
					this.templatePath('react/Element.tsx'),
					this.destinationPath(`src/graphics/${elementName}.tsx`),
					{
						elementName,
					},
				);
			} else {
				this.fs.copyTpl(this.templatePath('vanilla/graphic.html'), this.destinationPath(htmlFileName), {
					scriptName: `${fileNameNoExt}.${this.props.typescript ? 'ts' : 'js'}`,
					typescript: this.props.typescript,
				});
				this.fs.copy(
					this.templatePath(this.props.typescript ? 'vanilla/graphic.ts' : 'vanilla/graphic.js'),
					this.destinationPath(
						this.props.typescript ? `src/graphics/${fileNameNoExt}.ts` : `graphics/${fileNameNoExt}.js`,
					),
				);
			}
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
