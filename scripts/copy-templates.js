import path from 'path';
import appRootPath from 'app-root-path';
import fse from 'fs-extra/esm';

const generatorsPath = path.resolve(appRootPath.path, 'src/generators');

for (const generator of ['app', 'extension', 'graphic', 'panel']) {
	fse.copySync(path.join(generatorsPath, `${generator}/templates`), `generators/${generator}/templates`);
}
