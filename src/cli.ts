#!/usr/bin/env node

import { program } from 'commander';
import { loadConfig, parseConfig, parseWatchConfig } from './lib/config-loader';
import { build, watch } from './lib/builder';
import fs from 'fs-extra';

const main = async () => {
  const { name, version, description } = JSON.parse(await fs.readFile(`${__dirname}/../../package.json`, 'utf8'));

  program.name(name).description(description).version(version, '-v, --version');

  program
    .requiredOption('-c, --config <file>', 'the config file to use', './esbuild-azure-functions.config.json')
    .option('-w, --watch', 'enable watch mode', false);

  program.showSuggestionAfterError();
  program.parse();

  const options = program.opts();

  const file = await loadConfig(options.config);

  if (!options.watch) {
    const config = parseConfig(file);
    await build(config);
  } else {
    const config = parseWatchConfig(file);
    await watch(config);
  }
};

main();
