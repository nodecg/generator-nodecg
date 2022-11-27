"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yeoman_generator_1 = __importDefault(require("yeoman-generator"));
const deep_extend_1 = __importDefault(require("deep-extend"));
const lodash_1 = __importDefault(require("lodash"));
module.exports = class extends yeoman_generator_1.default {
    constructor(args, opts) {
        super(args, opts);
        this.props = {};
    }
    async prompting() {
        await this._askForPanelName();
        await this._askFor();
    }
    // Begin by asking for just the panel name.
    // This will be used to supply the default panel title.
    async _askForPanelName() {
        const prompts = [
            {
                type: 'input',
                name: 'name',
                message: "Your panel's name",
                default: 'panel',
                filter: lodash_1.default.kebabCase,
                validate(input) {
                    return input && input.length > 0;
                },
            },
        ];
        const props = await this.prompt(prompts);
        this.props = (0, deep_extend_1.default)(this.props, props);
    }
    async _askFor() {
        const prompts = [
            {
                type: 'input',
                name: 'title',
                message: "Your panel's title",
                default: lodash_1.default.startCase(this.props.name),
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
                message: 'How many width units (1-8) should your panel be? (Actual size in px: [144*n - 16] with n being the entered width unit)',
                default: 2,
                when(answers) {
                    return !answers.fullbleed;
                },
                filter(input) {
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
        ];
        const props = await this.prompt(prompts);
        this.props = (0, deep_extend_1.default)(this.props, props);
    }
    writing() {
        var _a, _b, _c, _d;
        const html = this.fs.read(this.templatePath('panel.html'));
        const panelFilePath = this.destinationPath(`dashboard/${this.props.name}.html`);
        if (!this.fs.exists(panelFilePath)) {
            this.fs.write(panelFilePath, html);
        }
        const panelProps = {
            name: this.props.name,
            title: this.props.title,
            width: this.props.width,
            file: `${this.props.name}.html`,
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
                panelProps.dialogButtons = (_a = panelProps.dialogButtons) !== null && _a !== void 0 ? _a : [];
                panelProps.dialogButtons.push({
                    name: this.props.dialogConfirmBtnLabel,
                    type: 'confirm',
                });
            }
            if (this.props.dialogDismissBtn) {
                panelProps.dialogButtons = (_b = panelProps.dialogButtons) !== null && _b !== void 0 ? _b : [];
                panelProps.dialogButtons.push({
                    name: this.props.dialogDismissBtnLabel,
                    type: 'dismiss',
                });
            }
        }
        else {
            panelProps.headerColor = this.props.headerColor;
        }
        // Re-read the content at this point because a composed generator might modify it.
        const currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});
        currentPkg.nodecg = (_c = currentPkg.nodecg) !== null && _c !== void 0 ? _c : {};
        currentPkg.nodecg.dashboardPanels = (_d = currentPkg.nodecg.dashboardPanels) !== null && _d !== void 0 ? _d : [];
        currentPkg.nodecg.dashboardPanels.push(panelProps);
        // Let's extend package.json so we're not overwriting user previous fields
        this.fs.writeJSON(this.destinationPath('package.json'), currentPkg);
    }
};
//# sourceMappingURL=index.js.map