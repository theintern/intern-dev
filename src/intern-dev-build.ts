#!/usr/bin/env node

import { echo } from 'shelljs';
import { dirname, join } from 'path';
import { red } from 'chalk';
import { buildDir, copyAll, exec, fixSourceMaps, getConfigs, internDev, tsconfig } from './common';

getConfigs().forEach(function (tsconfig) {
	echo(`## Compiling ${dirname(tsconfig)}`);
	try {
		exec(`tsc -p "${tsconfig}"`);
	}
	catch (error) {
		if (error.name === 'ExecError') {
			echo(red(error.stdout));
			process.exit(error.code);
		}
		else {
			throw error;
		}
	}
});

if (tsconfig.compilerOptions.inlineSources) {
	// If the project has inline sources in source maps set, set the path
	// to the source file to be a sibling of the compiled file
	echo('## Fixing source map paths');
	fixSourceMaps();
}

copyAll([
	'package.json',
	'README*',
	'LICENSE*'
], join(buildDir, 'src'));

if (internDev && internDev.resources) {
	const resources = internDev.resources;
	Object.keys(resources).forEach(dest => {
		copyAll(resources[dest], dest);
	});
}

echo('## Done building');
