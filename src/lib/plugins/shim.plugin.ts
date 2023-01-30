import { Plugin, PluginBuild } from 'esbuild';
import * as path from 'path';
import { Shim, ShimImport } from '../types/shim';

type ShimPluginOptions = { shims: Shim[] };

export const shimPlugin = ({ shims }: ShimPluginOptions): Plugin => ({
  name: 'shim',
  setup: (build: PluginBuild) => {
    build.initialOptions.write = false;

    const builtShims = buildShims(shims);

    build.onEnd(result => {
      const outputs = [];

      for (const file of result.outputFiles || []) {
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

const buildShims = (shims: Shim[]) => {
  const importStatements = shims.flatMap(({ imports }) => imports.map(shimImport => buildImportStatement(shimImport)));
  const codeParts = shims.flatMap(({ code }) => code);

  return [...importStatements, ...codeParts].join('\n');
};

const buildImportStatement = (shimImport: ShimImport) => {
  if (shimImport.isDefault) {
    return `import ${shimImport.as} from '${shimImport.from}';`;
  } else {
    return `import * as ${shimImport.as} from '${shimImport.from}';`;
  }
};
