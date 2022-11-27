"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const path_1 = __importDefault(require("path"));
module.exports = class extends yeoman_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this.props = {
            typescript: opts.typescript,
        };
    }
    async prompting() {
        const prompts = [
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
        // Only prompt for typescript if a parent generator didn't already do so
        if (typeof this.props.typescript === 'undefined') {
            prompts.push({
                name: 'typescript',
                message: 'Would you like to generate this graphic in TypeScript?',
                type: 'confirm',
            });
        }
        const props = await this.prompt(prompts);
        this.props = (0, deep_extend_1.default)(this.props, props);
    }
    writing() {
        var _a, _b;
        // Populate and write the graphic template
        const htmlFileName = this.props.typescript
            ? `src/graphics/${this.props.file}`
            : `graphics/${this.props.file}`;
        if (!this.fs.exists(this.destinationPath(htmlFileName))) {
            const fileNameNoExt = path_1.default.basename(htmlFileName, path_1.default.extname(this.props.file));
            const scriptSourceName = this.props.typescript
                ? `src/graphics/${fileNameNoExt}.ts`
                : `graphics/${fileNameNoExt}.js`;
            this.fs.copyTpl(this.templatePath('graphic.html'), this.destinationPath(htmlFileName), {
                scriptName: `${fileNameNoExt}.js`,
                sourceName: scriptSourceName,
            });
            this.fs.copy(this.templatePath(this.props.typescript ? 'graphic.ts' : 'graphic.js'), this.destinationPath(scriptSourceName));
        }
        const graphicProps = {
            file: this.props.file,
            width: this.props.width,
            height: this.props.height,
            singleInstance: false,
        };
        if (this.props.singleInstance) {
            graphicProps.singleInstance = this.props.singleInstance;
        }
        // Re-read the content at this point because a composed generator might modify it.
        const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
        currentPkg.nodecg = (_a = currentPkg.nodecg) !== null && _a !== void 0 ? _a : {};
        currentPkg.nodecg.graphics = (_b = currentPkg.nodecg.graphics) !== null && _b !== void 0 ? _b : [];
        currentPkg.nodecg.graphics.push(graphicProps);
        // Let's extend package.json so we're not overwriting user previous fields
        this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
    }
};
//# sourceMappingURL=index.js.map