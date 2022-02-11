/* eslint-disable @typescript-eslint/no-explicit-any */

import { BuildOptions } from 'esbuild';
import { BuilderLogLevel, isBuilderLogLevel } from './loglevel';

export interface BuilderConfig {
  project: string;
  entryPoints?: string[];
  exclude?: string[];
  esbuildOptions?: BuildOptions;
  clean?: boolean;
  loglevel?: BuilderLogLevel;
}

export function isBuilderConfig(arg: any): arg is BuilderConfig {
  console.log(isBuilderLogLevel(arg?.loglevel));

  return (
    arg !== null &&
    arg !== undefined &&
    typeof arg.project === 'string' &&
    (!arg.entryPoints ||
      (Array.isArray(arg.entryPoints) && arg.entryPoints.every((x: any) => typeof x === 'string'))) &&
    (!arg.exclude || (Array.isArray(arg.exclude) && arg.exclude.every((x: any) => typeof x === 'string'))) &&
    (!arg.clean || typeof arg.clean === 'boolean') &&
    isBuilderLogLevel(arg.loglevel)
  );
}
