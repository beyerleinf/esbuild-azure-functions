import { PluginBuild, Plugin, OnStartResult } from 'esbuild';
import fs from 'fs/promises';

const dirnameShim = `
import __import_PATH from 'path';
import __import_URL from 'url'

const __dirname = __import_PATH.dirname(__import_URL.fileURLToPath(import.meta.url));
const __filename = __import_URL.fileURLToPath(import.meta.url);\n`;

/**
 * This plugin shims `__dirname` and `__filename` because they are not available in ESM.
 * It does this using `import.meta.url`.
 *
 * **Requires `metafile` to be enabled in the esbuild options.**
 *
 * @see https://nodejs.org/docs/latest/api/esm.html#no-__filename-or-__dirname
 * @returns The `esbuild` plugin.
 */
export const dirnamePlugin = (): Plugin => ({
  name: 'dirname',
  setup: (build: PluginBuild) => {
    build.onStart((): OnStartResult => {
      if (!build.initialOptions.metafile) {
        return { errors: [{ text: 'Metafile must be enabled.' }] };
      }

      return {};
    });

    build.onEnd(async args => {
      for (const output of Object.keys(args.metafile!.outputs)) {
        const initialContent = await fs.readFile(output, 'utf8');
        const modifiedContent = [dirnameShim, initialContent].join('');
        await fs.writeFile(output, modifiedContent);
      }
    });
  },
});
