import { Plugin, PluginBuild } from 'esbuild';
import * as path from 'path';

type ShimPluginOptions = { shims: string[] };

export const shimPlugin = ({ shims }: ShimPluginOptions): Plugin => ({
  name: 'shim',
  setup: (build: PluginBuild) => {
    build.initialOptions.write = false;

    build.onEnd(result => {
      const outputs = [];

      for (const file of result.outputFiles!) {
        if (path.extname(file.path) === '.map') {
          // don't modify the .map-files
          outputs.push(file);
        } else {
          outputs.push({
            ...file,
            text: [shims.join('\n'), file.text].join('\n'),
          });
        }
      }

      result.outputFiles = outputs;
    });
  },
});
