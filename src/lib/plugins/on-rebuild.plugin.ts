import { BuildOptions, BuildResult, Plugin, PluginBuild } from 'esbuild';
import fs from 'fs-extra';
import { createLogger } from '../helper';
import { BuilderLogLevelType } from '../models';

type OnRebuildPluginOptions = {
  callback?: (result: BuildResult<BuildOptions>) => void;
  logLevel?: BuilderLogLevelType;
};

export const onRebuildPlugin = ({ callback, logLevel }: OnRebuildPluginOptions): Plugin => ({
  name: 'shim',
  setup: (build: PluginBuild) => {
    build.initialOptions.write = false;
    const logger = createLogger(logLevel || 'error');

    build.onEnd(async result => {
      if (result.errors.length > 0) {
        logger.error('❌ Rebuild failed');
      } else {
        for (const file of result.outputFiles || []) {
          await fs.outputFile(file.path, file.text);
        }

        logger.info('⚡️ Rebuild succeeded');
      }

      if (callback) {
        callback(result);
      }
    });
  },
});
