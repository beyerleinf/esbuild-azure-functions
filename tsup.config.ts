import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  outDir: './build',
  dts: true,
  format: ['cjs', 'esm'],
});
