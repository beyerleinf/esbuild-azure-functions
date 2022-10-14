const { build } = require('../build/src/index');

const main = async () => {
  await build({
    project: '.',
    advancedOptions: {
      enableDirnameShim: false,
      enableRequireShim: false,
    },
    esbuildOptions: {
      outdir: 'testout',
      sourcemap: true,
      minify: false,
    },
    logLevel: 'verbose',
    clean: true,
  });
};

main();
