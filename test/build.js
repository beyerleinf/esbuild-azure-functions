const { build } = require('../build/src/index');

const main = async () => {
  await build({
    project: '.',
    advancedOptions: {
      enableDirnameShim: true,
      enableRequireShim: true,
    },
    entryPoints: ['test-func/index.ts'],
    esbuildOptions: {
      outdir: 'testout',
    },
    logLevel: 'verbose',
    clean: true,
  });
};

main();
