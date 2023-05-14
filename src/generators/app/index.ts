import path from 'path';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';
import _ from 'lodash-es';
import extend from 'deep-extend';
import githubUsername from 'github-username';
import parseAuthor from 'parse-author';
import type { PackageJson } from 'type-fest';
import {mkdirp} from "mkdirp";
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default class AppGenerator extends Generator {
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
		typescript?: boolean;
		react?: boolean;
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
			{
				name: 'typescript',
				message: 'Would you like to generate this bundle in TypeScript?',
				type: 'confirm',
			},
			{
				name: 'react',
				message: 'Would you like to generate this bundle in React?',
				type: 'confirm',
				default: false,
				when: (answers) => answers.typescript,
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

	async writing() {
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
				browserslist: {
					production: ['>0.5%', 'not dead', 'not op_mini all'],
					development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
				},
			},
			currentPkg,
		);

		// Combine the keywords
		if (this.props.keywords) {
			pkg.keywords = _.uniq(this.props.keywords.concat(pkg.keywords));
		}

		// Add TypeScript stuff
		if (this.props.typescript) {
			/* eslint-disable @typescript-eslint/naming-convention */
			pkg.scripts = {
				build: 'node scripts/build.mjs',
				'build:extension': 'node scripts/build.mjs --skipBrowser',
				watch: 'node scripts/build.mjs --watch',
				'watch:browser': 'node scripts/build.mjs --skipExtension --watch',
				dev: 'concurrently --kill-others "npm run watch:browser" "nodemon"',
				'generate-schema-types': 'trash src/types/schemas && nodecg schema-types',
			};
			/* eslint-enable @typescript-eslint/naming-convention */
		}

		// Let's extend package.json so we're not overwriting user previous fields
		this.fs.writeJSON(this.destinationPath('package.json'), pkg);

		// Write tsconfigs and typescript deps, if appropriate
		if (this.props.typescript) {
			if (!this.fs.exists(this.destinationPath('tsconfig.json'))) {
				this.fs.copy(this.templatePath('tsconfig.json'), this.destinationPath('tsconfig.json'));
			}

			if (!this.fs.exists(this.destinationPath('tsconfig.build.json'))) {
				this.fs.copy(this.templatePath('tsconfig.build.json'), this.destinationPath('tsconfig.build.json'));
			}

			if (!this.fs.exists(this.destinationPath('src/dashboard/tsconfig.json'))) {
				this.fs.copy(
					this.templatePath('tsconfig.dashboard.json'),
					this.destinationPath('src/dashboard/tsconfig.json'),
				);
			}

			if (!this.fs.exists(this.destinationPath('src/graphics/tsconfig.json'))) {
				this.fs.copy(
					this.templatePath('tsconfig.graphics.json'),
					this.destinationPath('src/graphics/tsconfig.json'),
				);
			}

			if (!this.fs.exists(this.destinationPath('src/extension/tsconfig.json'))) {
				this.fs.copy(
					this.templatePath('tsconfig.extension.json'),
					this.destinationPath('src/extension/tsconfig.json'),
				);
			}

			if (!this.fs.exists(this.destinationPath('scripts/build.mjs'))) {
				this.fs.copy(this.templatePath('scripts/build.mjs'), this.destinationPath('scripts/build.mjs'));
			}

			if (!this.fs.exists(this.destinationPath('.parcelrc'))) {
				this.fs.copy(this.templatePath('.parcelrc'), this.destinationPath('.parcelrc'));
			}

			if (!this.fs.exists(this.destinationPath('schemas/exampleReplicant.json'))) {
				this.fs.copy(
					this.templatePath('schemas/exampleReplicant.json'),
					this.destinationPath('schemas/exampleReplicant.json'),
				);
			}

			if (!this.fs.exists(this.destinationPath('src/types/schemas/index.d.ts'))) {
				this.fs.copy(
					this.templatePath('src/types/schemas/index.d.ts'),
					this.destinationPath('src/types/schemas/index.d.ts'),
				);
			}

			if (!this.fs.exists(this.destinationPath('src/types/schemas/exampleReplicant.d.ts'))) {
				this.fs.copy(
					this.templatePath('src/types/schemas/exampleReplicant.d.ts'),
					this.destinationPath('src/types/schemas/exampleReplicant.d.ts'),
				);
			}

			if (!this.fs.exists(this.destinationPath('nodemon.json'))) {
				this.fs.copy(this.templatePath('nodemon.json'), this.destinationPath('nodemon.json'));
			}

			await this.addDependencies(['ts-node']);
			await this.addDevDependencies([
				'typescript',
				'@types/node',
				'@parcel/core',
				'@parcel/config-default',
				'@parcel/reporter-cli',
				'@parcel/validator-typescript',
				'glob',
				'trash-cli',
				'nodemon',
				'concurrently',
			]);
			await this.addDevDependencies({
				/* eslint-disable @typescript-eslint/naming-convention */
				'@nodecg/types': this.props.compatibleRange ?? '*',
				/* eslint-enable @typescript-eslint/naming-convention */
			});

			if (this.props.react) {
				await this.addDependencies(['react', 'react-dom']);
				await this.addDependencies(['@types/react', '@types/react-dom']);
			}
		}

		// Populate and write the readme template
		if (!this.fs.exists(this.destinationPath('README.md'))) {
			this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), {
				name: this.props.name,
				compatibleRange: this.props.compatibleRange,
				typescript: this.props.typescript,
			});
		}

		// Replace the .gitignore from node:git with our own.
		this.fs.write(
			this.destinationPath('.gitignore'),
			'node_modules\ncoverage\nbower_components\n.parcel-cache\n/dashboard\n/graphics\n/extension',
		);
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
			this.composeWith(require.resolve('./../panel'), {
				typescript: this.props.typescript,
				react: this.props.react,
			});
		}

		if (this.props.graphic) {
			this.composeWith(require.resolve('./../graphic'), {
				typescript: this.props.typescript,
				react: this.props.react,
			});
		}

		if (this.props.extension) {
			this.composeWith(require.resolve('./../extension'), {
				typescript: this.props.typescript,
			});
		}
	}
};
