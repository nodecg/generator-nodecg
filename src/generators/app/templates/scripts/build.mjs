/**
 * Parcel build script
 * See https://parceljs.org/features/parcel-api/ for more info
 */

// Native
import { fileURLToPath } from 'url';
import { argv } from 'process';
import { execSync } from 'child_process';

// Packages
import { glob } from 'glob';
import { Parcel } from '@parcel/core';
import chokidar from 'chokidar';

// Ours
import pjson from '../package.json' assert { type: 'json' };
import debounce from './debounce.mjs';

const buildAll = argv.includes('--all');
const buildExtension = argv.includes('--extension') || buildAll;
const buildDashboard = argv.includes('--dashboard') || buildAll;
const buildGraphics = argv.includes('--graphics') || buildAll;
const buildSchemas = argv.includes('--schemas') || buildAll;

const bundlers = new Set();
const commonBrowserTargetProps = {
  engines: {
    browsers: ['last 5 Chrome versions'],
  },
  context: 'browser',
};

if (buildDashboard) {
  bundlers.add(
    new Parcel({
      entries: glob.sync('src/dashboard/**/*.html'),
      targets: {
        default: {
          ...commonBrowserTargetProps,
          distDir: 'dashboard',
          publicUrl: `/bundles/${pjson.name}/dashboard`,
        },
      },
      defaultConfig: '@parcel/config-default',
      additionalReporters: [
        {
          packageName: '@parcel/reporter-cli',
          resolveFrom: fileURLToPath(import.meta.url),
        },
      ],
    }),
  );
}

if (buildGraphics) {
  bundlers.add(
    new Parcel({
      entries: glob.sync('src/graphics/**/*.html'),
      targets: {
        default: {
          ...commonBrowserTargetProps,
          distDir: 'graphics',
          publicUrl: `/bundles/${pjson.name}/graphics`,
        },
      },
      defaultConfig: '@parcel/config-default',
      additionalReporters: [
        {
          packageName: '@parcel/reporter-cli',
          resolveFrom: fileURLToPath(import.meta.url),
        },
      ],
    }),
  );
}

if (buildExtension) {
  bundlers.add(
    new Parcel({
      entries: 'src/extension/index.ts',
      targets: {
        default: {
          context: 'node',
          distDir: 'extension',
        },
      },
      defaultConfig: '@parcel/config-default',
      additionalReporters: [
        {
          packageName: '@parcel/reporter-cli',
          resolveFrom: fileURLToPath(import.meta.url),
        },
      ],
    }),
  );
}

try {
  if (argv.includes('--watch')) {
    if (buildSchemas) {
      watchSchemas();
    }

    const watchPromises = [];
    for (const bundler of bundlers.values()) {
      watchPromises.push(
        bundler.watch((err) => {
          if (err) {
            // fatal error
            throw err;
          }
        }),
      );
    }

    await Promise.all(watchPromises);
  } else {
    if (buildSchemas) {
      doBuildSchemas();
    }

    const buildPromises = [];
    for (const bundler of bundlers.values()) {
      buildPromises.push(bundler.run());
    }

    await Promise.all(buildPromises);
  }

  console.log('Bundle build completed successfully');
} catch (_) {
  // the reporter-cli package will handle printing errors to the user
  process.exit(1);
}

function doBuildSchemas() {
  execSync('npm run generate-schema-types');
  process.stdout.write(`🔧 Built Replicant schema types!\n`);
}

function watchSchemas() {
  chokidar.watch('schemas/**/*.json').on('all', () => {
    debounce('compileSchemas', doBuildSchemas);
  });
}
