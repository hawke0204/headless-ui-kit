#!/usr/bin/env node
import os from 'node:os';
import * as nodePath from 'node:path';
import extract from 'extract-zip';
import fs from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';

const log = {
	info: (message: string) => console.log(chalk.blue('INFO ') + message),
	success: (message: string) => console.log(chalk.green('SUCCESS ') + message),
	warn: (message: string) => console.log(chalk.yellow('WARN ') + message),
	error: (message: string) => console.error(chalk.red('ERROR ') + message),
	title: (message: string) => console.log(chalk.bold(chalk.cyan(`${message}`))),
};

const addComponent = async (name: string, path?: string) => {
	log.title(
		`${chalk.blue('CLI')} Adding component: ${name} ${path ? `to ${path}` : ''}`,
	);

	try {
		const tempDir = fs.mkdtempSync(nodePath.join(os.tmpdir(), 'headless-ui-'));

		log.info(`Created temporary directory: ${chalk.dim(tempDir)}`);

		const releaseUrl =
			'https://github.com/headless-ui-kit/releases/download/v1.0.0/components.zip';

		const zipPath = nodePath.join(tempDir, 'components.zip');

		log.info(`Downloading components from ${chalk.dim(releaseUrl)}...`);

		const response = await fetch(releaseUrl);

		if (!response.ok) {
			throw new Error(
				`Failed to download: ${response.status} ${response.statusText}`,
			);
		}

		const arrayBuffer = await response.arrayBuffer();

		fs.writeFileSync(zipPath, Buffer.from(arrayBuffer));

		log.success('Download complete. Extracting files...');

		await extract(zipPath, { dir: tempDir });

		const componentSrcPath = nodePath.join(tempDir, 'components', name);

		if (!fs.existsSync(componentSrcPath)) {
			throw new Error(`Component ${name} not found in the release package!`);
		}

		const targetPath = path || process.cwd();

		if (!fs.existsSync(targetPath)) {
			fs.mkdirpSync(targetPath);
		}

		const componentDestPath = nodePath.join(targetPath, name);

		fs.copySync(componentSrcPath, componentDestPath);

		log.success(
			`Component ${chalk.bold(name)} successfully added to ${chalk.bold(targetPath)}`,
		);

		fs.removeSync(tempDir);

		log.info('Temporary files cleaned up.');
	} catch (error) {
		if (error instanceof Error) {
			log.error(`Error adding component: ${error.message}\n`);
		}

		process.exit(1);
	}
};

yargs(hideBin(process.argv))
	.scriptName('headless-ui')
	.version('0.0.1')
	.usage('$0 <cmd> [args]')
	.command(
		'add [name]',
		'Add a component to your project',
		(yargs) => {
			return yargs
				.positional('name', {
					type: 'string',
					describe: 'The name of the component to add',
					demandOption: true,
				})
				.option('path', {
					type: 'string',
					describe: 'Directory to add the component to',
					demandOption: true,
				});
		},
		(argv) => {
			addComponent(argv.name as string, argv.path as string);
		},
	)
	.demandCommand(1, 'You need to specify a command')
	.help()
	.alias('h', 'help')
	.parse();
