import { promises as fs } from 'fs';
import meow from 'meow';
import { build } from './builder';
import { createLogger } from './logger';
import { BuilderConfig, isBuilderConfig } from './models';

const logger = createLogger();

const help = `
  Usage:
    $ esbuild-azure-functions [options]`;

const cli = meow({
  help,
  importMeta: import.meta,
  flags: {
    help: { type: 'boolean', default: false, alias: 'h' },
    config: { type: 'string', alias: 'c', isRequired: true },
    debug: { type: 'boolean', default: false, alias: 'd' },
  },
});

function usage(msg?: string): void {
  if (msg) {
    logger.error(msg);
  }
  cli.showHelp(1);
}

async function main(configPath: string) {
  if (cli.flags.help) {
    return usage();
  }

  const config = await loadConfig(configPath);

  await build(config);
}

async function loadConfig(configPath: string): Promise<BuilderConfig> {
  let options: BuilderConfig = {
    project: process.cwd(),
  };

  try {
    options = JSON.parse(await fs.readFile(configPath, 'utf8'));

    if (isBuilderConfig(options)) {
      if (options.entryPoints && options.entryPoints.length === 0) {
        usage('No entry points provided.');
      }
    } else {
      logger.warn('Invalid config file. Using default options.');
    }
  } catch (error) {
    logger.warn('Invalid config file. Using default options.');
  }

  return options;
}

main(cli.flags.config);
