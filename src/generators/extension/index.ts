import Generator from 'yeoman-generator';
import extend from 'deep-extend';

module.exports = class extends Generator {
	public props: { type?: 'file' | 'folder' };

	constructor(args: string | string[], opts: Generator.GeneratorOptions) {
		super(args, opts);

		this.props = {};
	}

	async prompting() {
		const prompts: Generator.Questions = [
			{
				type: 'list',
				name: 'type',
				message: 'How should your extension be organized?',
				choices: [
					{
						name: 'In a folder (extension/index.js)',
						value: 'folder',
						short: 'folder',
					},
					{
						name: 'In one file (extension.js)',
						value: 'file',
						short: 'file',
					},
				],
				default: 'file',
			},
		];

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	writing() {
		// If this bundle already has an extension, do nothing.
		if (
			this.fs.exists(this.destinationPath('extension.js')) ||
			this.fs.exists(this.destinationPath('extension/index.js'))
		) {
			return;
		}

		const js = this.fs.read(this.templatePath('extension.js'));

		if (this.props.type === 'file') {
			this.fs.write(this.destinationPath('extension.js'), js);
		} else {
			this.fs.write(this.destinationPath('extension/index.js'), js);
		}
	}
};
