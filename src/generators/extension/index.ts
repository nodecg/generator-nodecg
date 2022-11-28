import Generator from 'yeoman-generator';
import extend from 'deep-extend';

module.exports = class extends Generator {
	public props: { typescript?: boolean };

	constructor(args: string | string[], opts: Generator.GeneratorOptions) {
		super(args, opts);

		this.props = {
			typescript: opts.typescript,
		};
	}

	async prompting() {
		const prompts: Generator.Questions = [];

		// Only prompt for typescript if a parent generator didn't already do so
		if (typeof this.props.typescript === 'undefined') {
			(prompts as any).push({
				name: 'typescript',
				message: 'Would you like to generate this extension in TypeScript?',
				type: 'confirm',
			});
		}

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	writing() {
		if (this.props.typescript) {
			// If this bundle already has an extension, do nothing.
			if (this.fs.exists(this.destinationPath('src/extension/index.ts'))) {
				return;
			}

			const ts = this.fs.read(this.templatePath('extension.ts'));
			this.fs.write(this.destinationPath('src/extension/index.ts'), ts);
		} else {
			// If this bundle already has an extension, do nothing.
			if (this.fs.exists(this.destinationPath('extension/index.js'))) {
				return;
			}

			const js = this.fs.read(this.templatePath('extension.js'));
			this.fs.write(this.destinationPath('extension/index.js'), js);
		}
	}
};
