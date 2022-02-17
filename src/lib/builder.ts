import { BuildOptions } from 'esbuild';
import { existsSync } from 'fs';
import path from 'path';
import { parseConfig } from './config-loader';
import { NoEntryPointsError, ProjectDirectoryNotFoundError } from './errors';
import * as esbuild from './esbuild';
import { glob } from './glob';
import { createLogger, Logger } from './logger';
import { BuilderConfigType } from './models';
import { rimraf } from './rimraf';

const defaultConfig: BuildOptions = {
  minify: true,
  bundle: true,
  sourcemap: false,
  watch: false,
  platform: 'node',
  splitting: true,
  format: 'esm',
  outdir: 'build',
};

export async function build(inputConfig: BuilderConfigType) {
  const start = Date.now();

  const config = parseConfig(inputConfig);
  const logger = createLogger(config.logLevel);

  const esbuildOptions = await _prepare(inputConfig, logger);

  await esbuild.build(esbuildOptions);

  logger.info(`⚡ Build complete. Took ${Date.now() - start}ms`);
}

export async function watch(inputConfig: BuilderConfigType) {
  const config = parseConfig(inputConfig);
  const logger = createLogger(config.logLevel);

  const esbuildOptions = await _prepare(inputConfig, logger);

  esbuildOptions.watch = {
    onRebuild: (error, result) => {
      if (error) {
        logger.error('❌ Rebuild failed');
      } else {
        logger.info('⚡ Rebuild succeeded');
      }
    },
  };

  await esbuild.build(esbuildOptions);
}

async function _prepare(inputConfig: BuilderConfigType, logger: Logger): Promise<BuildOptions> {
  if (!existsSync(inputConfig.project)) {
    logger.error(`Project path ${inputConfig.project} does not exist`);
    throw new ProjectDirectoryNotFoundError(inputConfig.project);
  }

  logger.verbose(`📂 Project root ${path.resolve(inputConfig.project)}`);

  let entryPoints: string[] = [];

  if (inputConfig.entryPoints) {
    entryPoints = inputConfig.entryPoints.map(entryPoint => path.resolve(inputConfig.project, entryPoint));
  } else {
    logger.verbose('🔍 No entry points specified, looking for index.ts files');

    const exclude = inputConfig.exclude || [];

    entryPoints = await glob('**/index.ts', {
      cwd: inputConfig.project,
      absolute: true,
      ignore: ['**/node_modules/**', ...exclude],
    });
  }

  if (entryPoints.length === 0) {
    logger.error('😔 No entry points available.');
    throw new NoEntryPointsError(inputConfig.project);
  }

  logger.verbose(`🔨 Building ${entryPoints.length} entry points`);

  const esbuildOptions = {
    ...defaultConfig,
    ...inputConfig.esbuildOptions,
    entryPoints,
  };

  if (inputConfig.clean) {
    logger.verbose(`🧹 Cleaning ${esbuildOptions.outdir}`);

    await rimraf(esbuildOptions.outdir!);
  }

  // fix outdir when only one entry point exists because esbuild
  // doesn't create the correct folder structure
  if (
    esbuildOptions.entryPoints &&
    Array.isArray(esbuildOptions.entryPoints) &&
    esbuildOptions.entryPoints.length === 1
  ) {
    esbuildOptions.outdir = path.join(
      esbuildOptions.outdir!,
      path.basename(path.dirname(esbuildOptions.entryPoints[0]))
    );
  }

  return esbuildOptions;
}
