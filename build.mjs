import { build } from 'esbuild';
import { promises as fs } from 'fs';
import rimraf from 'rimraf';
import { promisify } from 'util';

const outdir = './build';

const main = async () => {
  const { version, dependencies } = JSON.parse(await fs.readFile('./package.json', 'utf8'));

  await promisify(rimraf)(outdir);

  await build({
    entryPoints: ['./src/index.ts', './src/cli.ts'],
    external: Object.keys(dependencies),
    outdir,
    bundle: true,
    sourcemap: false,
    minify: false,
    platform: 'node',
    target: 'node12',
    format: 'esm',
    splitting: true,
    outExtension: { '.js': '.mjs' },
    define: { PACKAGE_VERSION: `"${version}"` },
  });
};

main();
