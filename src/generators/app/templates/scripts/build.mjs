/**
 * Parcel build script
 * See https://parceljs.org/features/parcel-api/ for more info
 */

// Native
import { fileURLToPath } from 'url';
import path from 'path';

// Packages
import glob from 'glob';
import { Parcel } from '@parcel/core';

// Ours
import pjson from '../package.json' assert { type: 'json' };

const bundler = new Parcel({
	entries: [...glob.sync('src/{dashboard,graphics}/**/*.html'), ...glob.sync('src/extension/index.ts')],
	defaultConfig: '@parcel/config-default',
	defaultTargetOptions: {
		engines: {
			browsers: ['last 5 Chrome versions'],
		},
		publicUrl: `/bundles/${pjson.name}`,
		distDir: '.',
	},
	additionalReporters: [
		{
			packageName: '@parcel/reporter-cli',
			resolveFrom: fileURLToPath(import.meta.url),
		},
	],
});

try {
	if (process.argv.includes('--watch')) {
		await bundler.watch((err, event) => {
			if (err) {
				// fatal error
				throw err;
			}

			if (event.type === 'buildSuccess') {
				const bundles = event.bundleGraph.getBundles();
				console.log(`✨ Built ${bundles.length} bundles in ${event.buildTime}ms!`);
			} else if (event.type === 'buildFailure') {
				// the reporter-cli package will handle printing errors to the user
			}
		});
	} else {
		const { bundleGraph, buildTime } = await bundler.run();
		const bundles = bundleGraph.getBundles();
		console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
	}
} catch (_) {
	// the reporter-cli package will handle printing errors to the user
	process.exit(1);
}
