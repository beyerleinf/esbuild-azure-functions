import { program } from 'commander';
import { loadConfig, parseConfig } from './lib/config-loader';
import { build } from './lib/builder';

program
  .name('esbuild-azure-functions')
  .description('A builder for Azure Functions powered by esbuild.')
  .version('0.1.0', '-v, --version');
program.requiredOption('-c, --config <file>', 'the config file to use', './esbuild-azure-functions.config.json');
program.showSuggestionAfterError();
program.parse();

const options = program.opts();

const main = async () => {
  const file = await loadConfig(options.config);
  const config = parseConfig(file);

  await build(config);
};

main();
