import { BuildOptions } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { parseConfig } from './config-loader';
import { NoEntryPointsError, ProjectDirectoryNotFoundError } from './errors';
import * as esbuild from './esbuild';
import { glob } from './glob';
import { createLogger } from './logger';
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

  if (!fs.existsSync(config.project)) {
    logger.error(`Project path ${config.project} does not exist`);
    throw new ProjectDirectoryNotFoundError(config.project);
  }

  logger.verbose(`📂 Project root ${path.resolve(config.project)}`);

  let entryPoints: string[] = [];

  if (config.entryPoints) {
    entryPoints = config.entryPoints.map(entryPoint => path.resolve(config.project, entryPoint));
  } else {
    logger.verbose('🔍 No entry points specified, looking for index.ts files');

    const exclude = config.exclude || [];

    entryPoints = await glob('**/index.ts', {
      cwd: config.project,
      absolute: true,
      ignore: ['**/node_modules/**', ...exclude],
    });
  }

  if (entryPoints.length === 0) {
    logger.error('No entry points supplied.');
    throw new NoEntryPointsError(config.project);
  }

  logger.verbose(`🔨 Building ${entryPoints.length} entry points`);

  const esbuildOptions: BuildOptions = {
    ...defaultConfig,
    ...config.esbuildOptions,
    entryPoints,
  };

  if (config.clean) {
    logger.verbose(`🧹 Cleaning ${esbuildOptions.outdir}`);

    await rimraf(esbuildOptions.outdir!);
  }

  // fix outdir when only one entry point exists because esbuild
  // doesn't create the correct folder structure
  if (entryPoints.length === 1) {
    esbuildOptions.outdir = path.join(esbuildOptions.outdir!, path.basename(path.dirname(entryPoints[0])));
  }

  await esbuild.build(esbuildOptions);

  logger.info(`⚡ Build complete. Took ${Date.now() - start}ms`);
}
