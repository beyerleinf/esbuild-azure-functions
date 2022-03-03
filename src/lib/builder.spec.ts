import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiExclude from 'chai-exclude';
import { BuildOptions } from 'esbuild';
import fs from 'fs/promises';
import mockFS from 'mock-fs';
import path from 'path';
import sinon from 'sinon';
import { ZodError } from 'zod';
import { build, watch } from './builder';
import * as configLoader from './config-loader';
import { InvalidConfigError, NoEntryPointsError, ProjectDirectoryNotFoundError } from './errors';
import * as esbuild from './helper/esbuild';
import * as glob from './helper/glob';
import * as logger from './helper/logger';
import * as rimraf from './helper/rimraf';
import { BuilderConfigType } from './models';
import * as shimPlugin from './plugins/shim.plugin';
import * as shims from './shims';

/* eslint-disable @typescript-eslint/no-explicit-any */

chaiUse(chaiAsPromised);
chaiUse(chaiExclude);

const expectedDefaultConfig: BuildOptions = {
  bundle: true,
  format: 'esm',
  minify: true,
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  platform: 'node',
  sourcemap: false,
  splitting: true,
  target: 'node12',
  watch: false,
  write: false,
};

const projectDir = 'my/project';

describe('Builder', () => {
  let sandbox: sinon.SinonSandbox;

  let esbuildStub: sinon.SinonStub;
  let parseConfigStub: sinon.SinonStub;
  let globStub: sinon.SinonStub;
  let rimrafStub: sinon.SinonStub;
  let shimPluginStub: sinon.SinonStub;

  let mockLogger: {
    error: sinon.SinonStub;
    warn: sinon.SinonStub;
    info: sinon.SinonStub;
    verbose: sinon.SinonStub;
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockFS({
      [projectDir]: mockFS.directory(),
    });

    mockLogger = {
      error: sandbox.stub(),
      warn: sandbox.stub(),
      info: sandbox.stub(),
      verbose: sandbox.stub(),
    };

    esbuildStub = sandbox.stub(esbuild, 'build').resolves({ outputFiles: [], errors: [], warnings: [] });
    parseConfigStub = sandbox.stub(configLoader, 'parseConfig');
    globStub = sandbox.stub(glob, 'glob').resolves([]);
    rimrafStub = sandbox.stub(rimraf, 'rimraf').resolves();
    shimPluginStub = sandbox.stub(shimPlugin, 'shimPlugin').returns('shimPluginStub' as any);

    sandbox.stub(logger, 'createLogger').returns(mockLogger);
  });

  afterEach(() => {
    sandbox.restore();
    mockFS.restore();
  });

  describe('build', () => {
    it('should parse config', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints: ['func/index.ts'],
        clean: true,
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(parseConfigStub.calledOnce).to.be.true;
      expect(parseConfigStub.firstCall.args[0]).to.eql(config);
    });

    it('should call esbuild.build with correct config when entryPoints were supplied', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        plugins: [],
      });
    });

    it('should call esbuild.build with correct config when esbuildOptions were supplied', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        plugins: [],
      });
    });

    it('should glob all index.ts files when no entryPoints were supplied', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        esbuildOptions: {
          outdir: 'something',
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`, `${process.cwd()}/${projectDir}/func2/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await build(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        plugins: [],
      });
      expect(globStub.calledOnce).to.be.true;
      expect(globStub.firstCall.args).to.eql([
        '**/index.ts',
        {
          cwd: projectDir,
          absolute: true,
          ignore: ['**/node_modules/**'],
        },
      ]);
    });

    it('should glob all index.ts files when no entryPoints but excludes were supplied', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir: 'something',
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`, `${process.cwd()}/${projectDir}/func2/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await build(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        plugins: [],
      });
      expect(globStub.calledOnce).to.be.true;
      expect(globStub.firstCall.args).to.eql([
        '**/index.ts',
        {
          cwd: projectDir,
          absolute: true,
          ignore: ['**/node_modules/**', ...config.exclude!],
        },
      ]);
    });

    it('should rimraf outdir when clean is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];
      const outdir = 'someOutdir';

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        clean: true,
        esbuildOptions: {
          outdir,
        },
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(rimrafStub.calledOnce).to.be.true;
      expect(rimrafStub.firstCall.args[0]).to.eql(outdir);
    });

    it('should fix outdir when only one entry point is found', async () => {
      const outdir = 'some/outdir';

      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir,
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await build(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        outdir: path.join(outdir, path.basename(path.dirname(files[0]))),
        plugins: [],
      });
    });

    it('should add shim plugin with dirname shim when advancedOptions.enableDirnameShim is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
        advancedOptions: {
          enableDirnameShim: true,
        },
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;

      expect(shimPluginStub.calledOnce).to.be.true;
      expect(shimPluginStub.firstCall.args[0]).to.eql({ shims: [shims.DIRNAME_SHIM] });

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        plugins: ['shimPluginStub'],
      });
    });

    it('should add shim plugin with require shim when advancedOptions.enableRequireShim is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
        advancedOptions: {
          enableRequireShim: true,
        },
      };

      parseConfigStub.returns(config);

      await build(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;

      expect(shimPluginStub.calledOnce).to.be.true;
      expect(shimPluginStub.firstCall.args[0]).to.eql({ shims: [shims.REQUIRE_SHIM] });

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectedDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        plugins: ['shimPluginStub'],
      });
    });

    it('should write output files', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      esbuildStub.resolves({
        outputFiles: [
          { path: 'some/dir/file1', text: 'content1' },
          { path: 'some/dir/file2', text: 'content2' },
        ],
      });

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
      };

      parseConfigStub.returns(config);

      await build(config);

      const output1 = await fs.readFile('some/dir/file1', 'utf8');
      const output2 = await fs.readFile('some/dir/file2', 'utf8');

      expect(output1).to.eql('content1');
      expect(output2).to.eql('content2');
    });

    it('should throw NoEntryPointsError when there are no entry points', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir: 'something',
        },
      };

      globStub.resolves([]);

      parseConfigStub.returns(config);

      return expect(build(config)).to.eventually.be.rejectedWith(NoEntryPointsError);
    });

    it('should throw ProjectDirectoryNotFoundError when project dir is invalid', async () => {
      const config: BuilderConfigType = {
        project: 'some/dir',
        entryPoints: ['func1/index.ts'],
      };

      parseConfigStub.returns(config);

      return expect(build(config)).to.eventually.be.rejectedWith(ProjectDirectoryNotFoundError);
    });

    it('should throw InvalidConfigFileError when parseConfig throws', async () => {
      parseConfigStub.throws(new InvalidConfigError(new ZodError([])));

      return expect(build({} as any)).to.eventually.be.rejectedWith(InvalidConfigError);
    });
  });

  describe('watch', () => {
    it('should parse config', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints: ['func/index.ts'],
        clean: true,
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(parseConfigStub.calledOnce).to.be.true;
      expect(parseConfigStub.firstCall.args[0]).to.eql(config);
    });

    it('should call esbuild.build with correct config when entryPoints were supplied', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding('watch')
        .to.eql({
          ...expectedDefaultConfig,
          entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
          plugins: [],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
    });

    it('should call esbuild.build with correct config when esbuildOptions were supplied', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding('watch')
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
          plugins: [],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
    });

    it('should glob all index.ts files when no entryPoints were supplied', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        esbuildOptions: {
          outdir: 'something',
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`, `${process.cwd()}/${projectDir}/func2/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await watch(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding('watch')
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: files,
          plugins: [],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
      expect(globStub.calledOnce).to.be.true;
      expect(globStub.firstCall.args).to.eql([
        '**/index.ts',
        {
          cwd: projectDir,
          absolute: true,
          ignore: ['**/node_modules/**'],
        },
      ]);
    });

    it('should glob all index.ts files when no entryPoints but excludes were supplied', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir: 'something',
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`, `${process.cwd()}/${projectDir}/func2/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await watch(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding('watch')
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: files,
          plugins: [],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
      expect(globStub.calledOnce).to.be.true;
      expect(globStub.firstCall.args).to.eql([
        '**/index.ts',
        {
          cwd: projectDir,
          absolute: true,
          ignore: ['**/node_modules/**', ...config.exclude!],
        },
      ]);
    });

    it('should rimraf outdir when clean is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];
      const outdir = 'someOutdir';

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        clean: true,
        esbuildOptions: {
          outdir,
        },
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(rimrafStub.calledOnce).to.be.true;
      expect(rimrafStub.firstCall.args[0]).to.eql(outdir);
    });

    it('should fix outdir when only one entry point is found', async () => {
      const outdir = 'some/outdir';

      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir,
        },
      };

      const files = [`${process.cwd()}/${projectDir}/func1/index.ts`];
      globStub.resolves(files);

      parseConfigStub.returns(config);

      await watch(config);

      expect(rimrafStub.called).to.be.false;
      expect(shimPluginStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding('watch')
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: files,
          outdir: path.join(outdir, path.basename(path.dirname(files[0]))),
          plugins: [],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
    });

    it('should add dirname plugin when advancedOptions.enableDirnameShim is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
        advancedOptions: {
          enableDirnameShim: true,
        },
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;

      expect(shimPluginStub.calledOnce).to.be.true;
      expect(shimPluginStub.firstCall.args[0]).to.eql({ shims: [shims.DIRNAME_SHIM] });

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding(['watch'])
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
          plugins: ['shimPluginStub'],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
    });

    it('should add require plugin when advancedOptions.enableRequireShim is true', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
        esbuildOptions: {
          outdir: 'something',
        },
        advancedOptions: {
          enableRequireShim: true,
        },
      };

      parseConfigStub.returns(config);

      await watch(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;

      expect(shimPluginStub.calledOnce).to.be.true;
      expect(shimPluginStub.firstCall.args[0]).to.eql({ shims: [shims.REQUIRE_SHIM] });

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0])
        .excluding(['watch'])
        .to.eql({
          ...expectedDefaultConfig,
          ...config.esbuildOptions,
          entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
          plugins: ['shimPluginStub'],
        });
      expect(typeof esbuildStub.firstCall.args[0].watch.onRebuild).to.eql('function');
    });

    it('should call logger.error when onRebuild gets called with error', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
      };

      parseConfigStub.returns(config);

      await watch(config);

      mockLogger.verbose.resetHistory();
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();

      await esbuildStub.firstCall.args[0].watch.onRebuild({});

      expect(mockLogger.verbose.called).to.be.false;
      expect(mockLogger.info.called).to.be.false;
      expect(mockLogger.warn.called).to.be.false;
      expect(mockLogger.error.calledOnce).to.be.true;
    });

    it('should call logger.info when onRebuild gets called without error', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
      };

      parseConfigStub.returns(config);

      await watch(config);

      mockLogger.verbose.resetHistory();
      mockLogger.info.resetHistory();
      mockLogger.warn.resetHistory();
      mockLogger.error.resetHistory();

      await esbuildStub.firstCall.args[0].watch.onRebuild();

      expect(mockLogger.verbose.called).to.be.false;
      expect(mockLogger.warn.called).to.be.false;
      expect(mockLogger.error.called).to.be.false;
      expect(mockLogger.info.calledOnce).to.be.true;
    });

    it('should write output files', async () => {
      const entryPoints = ['func1/index.ts', 'func2/index.ts'];

      const config: BuilderConfigType = {
        project: projectDir,
        entryPoints,
      };

      parseConfigStub.returns(config);

      await watch(config);

      await esbuildStub.firstCall.args[0].watch.onRebuild(undefined, {
        outputFiles: [
          { path: 'some/dir/file1', text: 'content1' },
          { path: 'some/dir/file2', text: 'content2' },
        ],
      });

      const output1 = await fs.readFile('some/dir/file1', 'utf8');
      const output2 = await fs.readFile('some/dir/file2', 'utf8');

      expect(output1).to.eql('content1');
      expect(output2).to.eql('content2');
    });

    it('should throw NoEntryPointsError when there are no entry points', async () => {
      const config: BuilderConfigType = {
        project: projectDir,
        exclude: ['dir1'],
        esbuildOptions: {
          outdir: 'something',
        },
      };

      globStub.resolves([]);

      parseConfigStub.returns(config);

      return expect(watch(config)).to.eventually.be.rejectedWith(NoEntryPointsError);
    });

    it('should throw ProjectDirectoryNotFoundError when project dir is invalid', async () => {
      const config: BuilderConfigType = {
        project: 'some/dir',
        entryPoints: ['func1/index.ts'],
      };

      parseConfigStub.returns(config);

      return expect(watch(config)).to.eventually.be.rejectedWith(ProjectDirectoryNotFoundError);
    });

    it('should throw InvalidConfigFileError when parseConfig throws', async () => {
      parseConfigStub.throws(new InvalidConfigError(new ZodError([])));

      return expect(watch({} as any)).to.eventually.be.rejectedWith(InvalidConfigError);
    });
  });
});
