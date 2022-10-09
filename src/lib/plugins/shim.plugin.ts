import { Plugin, PluginBuild } from 'esbuild';
import * as path from 'path';
import { shimBuilder } from '../helper/shim-builder';
import { Shim } from '../types/shim';

type ShimPluginOptions = { shims: Shim[] };

export const shimPlugin = ({ shims }: ShimPluginOptions): Plugin => ({
  name: 'shim',
  setup: (build: PluginBuild) => {
    build.initialOptions.write = false;

    const builtShims = shimBuilder(shims);

    build.onEnd(result => {
      const outputs = [];

      for (const file of result.outputFiles!) {
        if (path.extname(file.path) === '.map') {
          // don't modify the .map-files
          outputs.push(file);
        } else {
          outputs.push({
            ...file,
            text: [builtShims, file.text].join('\n'),
          });
        }
      }

      result.outputFiles = outputs;
    });
  },
});
