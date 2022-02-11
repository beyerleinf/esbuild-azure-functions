import esbuild from 'esbuild';
import { existsSync } from 'fs';
import glob from 'glob';
import path from 'path';
import rimraf from 'rimraf';
import { promisify } from 'util';
import { createLogger } from './logger';
import { BuilderConfig, isBuilderConfig } from './models';

const logger = createLogger();

const defaultConfig: esbuild.BuildOptions = {
  minify: true,
  bundle: true,
  sourcemap: false,
  watch: false,
  outExtension: { '.js': '.mjs' },
  platform: 'node',
  splitting: true,
  format: 'esm',
  outdir: 'build',
};

export async function build(config: BuilderConfig) {
  if (!isBuilderConfig(config)) {
    logger.error('Invalid config');
    throw new Error();
  }

  const start = Date.now();

  const projectPath = config.project;

  if (!existsSync(projectPath)) {
    logger.error(`Project path ${projectPath} does not exist`);
    throw new Error();
  }

  logger.verbose(`Building project ${projectPath}`);

  let entryPoints: string[];

  if (!config.entryPoints) {
    logger.verbose('No entry points specified, looking for all index.ts files');

    const exclude = config.exclude || [];

    const functionEntryPoints = await promisify(glob)('**/index.ts', {
      cwd: projectPath,
      absolute: true,
      ignore: ['**/node_modules/**', ...exclude],
    });

    entryPoints = functionEntryPoints;
  } else {
    entryPoints = config.entryPoints.map(entryPoint => path.resolve(projectPath, entryPoint));
  }

  if (entryPoints.length === 0) {
    logger.error('No entry points found');
    throw new Error();
  }

  logger.verbose(`🔨 Building ${entryPoints.length} entry points`);

  let esbuildOptions = {
    ...defaultConfig,
    ...config.esbuildOptions,
    entryPoints,
  };

  if (config.clean) {
    if (esbuildOptions?.outdir) {
      logger.verbose(`🧹 Cleaning ${esbuildOptions.outdir}`);
      await promisify(rimraf)(esbuildOptions.outdir);
    }
  }

  // fix outdir when only one entry point exists because esbuild
  // doesn't create the correct folder structure
  if (entryPoints.length === 1) {
    esbuildOptions = {
      ...esbuildOptions,
      outdir: path.join(esbuildOptions.outdir!, path.basename(path.dirname(entryPoints[0]))),
    };
  }

  await esbuild.build(esbuildOptions);

  logger.info(`⚡️ Build complete. Took ${Date.now() - start}ms`);
}
