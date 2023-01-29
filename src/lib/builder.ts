import { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import path from 'path';
import { parseConfig, parseWatchConfig } from './config-loader';
import { NoEntryPointsError, ProjectDirectoryNotFoundError } from './errors';
import { createLogger, glob, Logger, rimraf } from './helper';
import * as esbuild from './helper/esbuild';
import { BuilderConfigType, WatchConfigType } from './models';
import { onRebuildPlugin, shimPlugin } from './plugins';
import { DIRNAME_SHIM, REQUIRE_SHIM } from './shims';

const defaultConfig: BuildOptions = {
  bundle: true,
  format: 'esm',
  minify: true,
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  platform: 'node',
  sourcemap: false,
  splitting: true,
  target: 'node14',
  write: false,
};

export async function build(inputConfig: BuilderConfigType) {
  const start = Date.now();

  const config = parseConfig(inputConfig);
  const logger = createLogger(config.logLevel);

  const esbuildOptions = await _prepare(inputConfig, logger);

  const result = await esbuild.build(esbuildOptions);

  for (const file of result.outputFiles!) {
    await fs.outputFile(file.path, file.text);
  }

  logger.info(`⚡ Build complete. Took ${Date.now() - start}ms`);
}

export async function watch(inputConfig: WatchConfigType) {
  const config = parseWatchConfig(inputConfig);
  const logger = createLogger(config.logLevel);

  const esbuildOptions = await _prepare(inputConfig, logger);

  esbuildOptions.plugins!.push(onRebuildPlugin({ callback: config.onRebuild, logLevel: config.logLevel }));

  const ctx = await esbuild.context(esbuildOptions);

  return ctx.watch();
}

async function _prepare(inputConfig: BuilderConfigType, logger: Logger): Promise<BuildOptions> {
  if (!fs.pathExistsSync(inputConfig.project)) {
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

  const esbuildOptions: BuildOptions = {
    ...defaultConfig,
    ...inputConfig.esbuildOptions,
    entryPoints,
    plugins: _getPlugins(inputConfig),
  };

  await _clean(logger, esbuildOptions.outdir!, inputConfig.clean);

  // fix outdir when only one entry point exists because esbuild
  // doesn't create the correct folder structure
  if (isSingleEntryPoint(entryPoints)) {
    esbuildOptions.outdir = path.join(esbuildOptions.outdir!, path.basename(path.dirname(entryPoints[0])));
  }

  return esbuildOptions;
}

async function _clean(logger: Logger, dir: string, clean?: boolean) {
  if (clean) {
    logger.verbose(`🧹 Cleaning ${dir}`);

    await rimraf(dir);
  }
}

function _getPlugins(config: BuilderConfigType) {
  const plugins = config.esbuildOptions?.plugins || [];

  const shims = [];

  if (config.advancedOptions?.enableDirnameShim) {
    shims.push(DIRNAME_SHIM);
  }

  if (config.advancedOptions?.enableRequireShim) {
    shims.push(REQUIRE_SHIM);
  }

  if (shims.length > 0) {
    plugins.push(shimPlugin({ shims }));
  }

  return plugins;
}

function isSingleEntryPoint(entryPoints?: string[] | Record<string, string>): entryPoints is string[] {
  return !!entryPoints && Array.isArray(entryPoints) && entryPoints.length === 1;
}
