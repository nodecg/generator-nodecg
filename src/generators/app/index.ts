import path from 'path';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import _ from 'lodash';
import extend from 'deep-extend';
import mkdirp from 'mkdirp';
import githubUsername from 'github-username';
import parseAuthor from 'parse-author';
import type { PackageJson } from 'type-fest';

module.exports = class extends Generator {
	public props: {
		name?: string;
		description?: string;
		version?: string;
		homepage?: string;
		authorName?: string;
		authorEmail?: string;
		authorUrl?: string;
		githubAccount?: string;
		compatibleRange?: string;
		keywords?: string[];
		dashboardPanel?: boolean;
		graphic?: boolean;
		extension?: boolean;
	};

	private readonly pkg: PackageJson.PackageJsonStandard;

	constructor(args: string | string[], opts: Generator.GeneratorOptions) {
		super(args, opts);

		// Have Yeoman greet the user.
		this.log(yosay('Welcome to the ' + chalk.red('NodeCG bundle') + ' generator!'));

		this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {}) as PackageJson.PackageJsonStandard;

		// Pre set the default props from the information we have at this point
		this.props = {
			name: this.pkg.name,
			description: this.pkg.description,
			version: this.pkg.version,
			homepage: this.pkg.homepage,
		};

		if (_.isObject(this.pkg.author)) {
			this.props.authorName = this.pkg.author.name;
			this.props.authorEmail = this.pkg.author.email;
			this.props.authorUrl = this.pkg.author.url;
		} else if (_.isString(this.pkg.author)) {
			const info = parseAuthor(this.pkg.author);
			this.props.authorName = info.name;
			this.props.authorEmail = info.email;
			this.props.authorUrl = info.url;
		}
	}

	async prompting() {
		const prompts: Generator.Questions = [
			{
				name: 'name',
				message: 'Your bundle Name',
				default: _.kebabCase(path.basename(process.cwd())),
				filter: _.kebabCase,
				validate(str) {
					return str.length > 0;
				},
				when: !this.props.name,
			},
			{
				name: 'description',
				message: 'Description',
				when: !this.props.description,
			},
			{
				name: 'homepage',
				message: 'Project homepage url',
				when: !this.props.homepage,
			},
			{
				name: 'authorName',
				message: "Author's Name",
				when: !this.props.authorName,
				default: this.user.git.name(),
				store: true,
			},
			{
				name: 'authorEmail',
				message: "Author's Email",
				when: !this.props.authorEmail,
				default: this.user.git.email(),
				store: true,
			},
			{
				name: 'authorUrl',
				message: "Author's Homepage",
				when: !this.props.authorUrl,
				store: true,
			},
			{
				name: 'keywords',
				message: 'Package keywords (comma to split)',
				when: !this.pkg.keywords,
				filter(words) {
					return words.split(/\s*,\s*/g);
				},
			},
			{
				name: 'compatibleRange',
				message: 'What semver range of NodeCG versions is this bundle compatible with?',
				type: 'input',
				default: '^2.0.0',
			},
			{
				name: 'dashboardPanel',
				message: 'Would you like to make a dashboard panel for your bundle?',
				type: 'confirm',
			},
			{
				name: 'graphic',
				message: 'Would you like to make a graphic for your bundle?',
				type: 'confirm',
			},
			{
				name: 'extension',
				message: 'Would you like to add an extension to your bundle?',
				type: 'confirm',
			},
		];

		const props = await this.prompt(prompts);
		this.props = extend(this.props, props);
	}

	async askForGithubAccount() {
		let username = '';
		try {
			const un = await githubUsername(this.props.authorEmail!);
			username = un ?? '';
		} catch {}

		const prompt = await this.prompt({
			name: 'githubAccount',
			message: 'GitHub username or organization',
			default: username,
		});
		this.props.githubAccount = prompt.githubAccount;
	}

	writing() {
		// Re-read the content at this point because a composed generator might modify it.
		const currentPkg: PackageJson.PackageJsonStandard = this.fs.readJSON(
			this.destinationPath('package.json'),
			{},
		) as PackageJson.PackageJsonStandard;

		const pkg = extend(
			{
				name: _.kebabCase(this.props.name),
				version: '0.0.0',
				description: this.props.description,
				homepage: this.props.homepage,
				author: {
					name: this.props.authorName,
					email: this.props.authorEmail,
					url: this.props.authorUrl,
				},
				files: ['dashboard', 'graphics', 'extension.js', 'extension'],
				keywords: ['nodecg-bundle'],
				nodecg: {
					compatibleRange: this.props.compatibleRange,
				},
			},
			currentPkg,
		);

		// Combine the keywords
		if (this.props.keywords) {
			pkg.keywords = _.uniq(this.props.keywords.concat(pkg.keywords));
		}

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), pkg);

		// Populate and write the readme template
		if (!this.fs.exists(this.destinationPath('README.md'))) {
			this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), {
				name: this.props.name,
				compatibleRange: this.props.compatibleRange,
			});
		}

		// Replace the .gitignore from node:git with our own.
		this.fs.write(this.destinationPath('.gitignore'), 'node_modules\ncoverage\nbower_components');
	}

	default() {
		if (path.basename(this.destinationPath()) !== this.props.name) {
			this.log(
				`Your bundle must be inside a folder named ${this.props
					.name!}\n I'll automatically create this folder.`,
			);
			mkdirp.sync(this.props.name!);
			this.destinationRoot(this.destinationPath(this.props.name!));
		}

		this.composeWith(require.resolve('generator-node/generators/git'), {
			name: this.props.name,
			githubAccount: this.props.githubAccount,
		});

		if (!this.pkg.license) {
			this.composeWith(require.resolve('generator-license/app'), {
				name: this.props.authorName,
				email: this.props.authorEmail,
				website: this.props.authorUrl,
			});
		}

		if (this.props.dashboardPanel) {
			this.composeWith(require.resolve('./../panel'));
		}

		if (this.props.graphic) {
			this.composeWith(require.resolve('./../graphic'));
		}

		if (this.props.extension) {
			this.composeWith(require.resolve('./../extension'));
		}
	}
};
