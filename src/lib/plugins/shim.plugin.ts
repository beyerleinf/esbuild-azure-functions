import { Plugin, PluginBuild } from 'esbuild';

type ShimPluginOptions = { shims: string[] };

export const shimPlugin = ({ shims }: ShimPluginOptions): Plugin => ({
  name: 'shim',
  setup: (build: PluginBuild) => {
    build.initialOptions.write = false;

    build.onEnd(result => {
      const outputs = [];

      for (const file of result.outputFiles!) {
        outputs.push({
          ...file,
          text: [shims.join('\n'), file.text].join('\n'),
        });
      }

      result.outputFiles = outputs;
    });
  },
});
