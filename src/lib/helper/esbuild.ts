import { BuildOptions } from 'esbuild';
import * as esbuild from 'esbuild';

/* c8 ignore start */
export async function build(options: BuildOptions) {
  return esbuild.build(options);
}

export async function context(options: BuildOptions) {
  return esbuild.context(options);
}
/* c8 ignore stop */
