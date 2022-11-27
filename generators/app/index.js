"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
const chalk_1 = __importDefault(require("chalk"));
const yosay_1 = __importDefault(require("yosay"));
const lodash_1 = __importDefault(require("lodash"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const github_username_1 = __importDefault(require("github-username"));
const parse_author_1 = __importDefault(require("parse-author"));
module.exports = class extends yeoman_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        // Have Yeoman greet the user.
        this.log((0, yosay_1.default)('Welcome to the ' + chalk_1.default.red('NodeCG bundle') + ' generator!'));
        this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
        // Pre set the default props from the information we have at this point
        this.props = {
            name: this.pkg.name,
            description: this.pkg.description,
            version: this.pkg.version,
            homepage: this.pkg.homepage,
        };
        if (lodash_1.default.isObject(this.pkg.author)) {
            this.props.authorName = this.pkg.author.name;
            this.props.authorEmail = this.pkg.author.email;
            this.props.authorUrl = this.pkg.author.url;
        }
        else if (lodash_1.default.isString(this.pkg.author)) {
            const info = (0, parse_author_1.default)(this.pkg.author);
            this.props.authorName = info.name;
            this.props.authorEmail = info.email;
            this.props.authorUrl = info.url;
        }
    }
    async prompting() {
        const prompts = [
            {
                name: 'name',
                message: 'Your bundle Name',
                default: lodash_1.default.kebabCase(path_1.default.basename(process.cwd())),
                filter: lodash_1.default.kebabCase,
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
        ];
        const props = await this.prompt(prompts);
        this.props = (0, deep_extend_1.default)(this.props, props);
    }
    async askForGithubAccount() {
        let username = '';
        try {
            const un = await (0, github_username_1.default)(this.props.authorEmail);
            username = un !== null && un !== void 0 ? un : '';
        }
        catch (_a) { }
        const prompt = await this.prompt({
            name: 'githubAccount',
            message: 'GitHub username or organization',
            default: username,
        });
        this.props.githubAccount = prompt.githubAccount;
    }
    async writing() {
        // Re-read the content at this point because a composed generator might modify it.
        const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
        const pkg = (0, deep_extend_1.default)({
            name: lodash_1.default.kebabCase(this.props.name),
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
        }, currentPkg);
        // Combine the keywords
        if (this.props.keywords) {
            pkg.keywords = lodash_1.default.uniq(this.props.keywords.concat(pkg.keywords));
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
            await this.addDependencies(['ts-node']);
            await this.addDevDependencies(['typescript', '@types/node']);
        }
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
        if (path_1.default.basename(this.destinationPath()) !== this.props.name) {
            this.log(`Your bundle must be inside a folder named ${this.props
                .name}\n I'll automatically create this folder.`);
            mkdirp_1.default.sync(this.props.name);
            this.destinationRoot(this.destinationPath(this.props.name));
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
            this.composeWith(require.resolve('./../extension'), {
                typescript: this.props.typescript,
            });
        }
    }
};
//# sourceMappingURL=index.js.map