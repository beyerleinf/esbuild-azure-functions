import { program } from 'commander';
import { loadConfig, parseConfig } from './lib/config-loader';
import { build, watch } from './lib/builder';
import { promises as fs } from 'fs';

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
  const config = parseConfig(file);

  if (!options.watch) {
    await build(config);
  } else {
    await watch(config);
  }
};

main();
