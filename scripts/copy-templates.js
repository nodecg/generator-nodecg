const fse = require('fs-extra');
const path = require('path');
const appRootPath = require('app-root-path');

const generatorsPath = path.resolve(appRootPath.path, 'src/generators');

for (const generator of ['app', 'extension', 'graphic', 'panel']) {
	fse.copySync(path.join(generatorsPath, `${generator}/templates`), `generators/${generator}/templates`);
}
