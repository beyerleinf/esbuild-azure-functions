import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BuildOptions } from 'esbuild';
import mockFS from 'mock-fs';
import path from 'path';
import sinon from 'sinon';
import { ZodError } from 'zod';
import { build, watch } from './builder';
import * as configLoader from './config-loader';
import { InvalidConfigError, NoEntryPointsError, ProjectDirectoryNotFoundError } from './errors';
import * as esbuild from './esbuild';
import * as glob from './glob';
import * as logger from './logger';
import { BuilderConfigType } from './models';
import * as rimraf from './rimraf';

/* eslint-disable @typescript-eslint/no-explicit-any */

chaiUse(chaiAsPromised);

const expectDefaultConfig: BuildOptions = {
  minify: true,
  bundle: true,
  sourcemap: false,
  watch: false,
  platform: 'node',
  splitting: true,
  format: 'esm',
  outdir: 'build',
};

const projectDir = 'my/project';

describe('Builder', () => {
  let sandbox: sinon.SinonSandbox;

  let esbuildStub: sinon.SinonStub;
  let parseConfigStub: sinon.SinonStub;
  let globStub: sinon.SinonStub;
  let rimrafStub: sinon.SinonStub;

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

    esbuildStub = sandbox.stub(esbuild, 'build').resolves();
    parseConfigStub = sandbox.stub(configLoader, 'parseConfig');
    globStub = sandbox.stub(glob, 'glob').resolves([]);
    rimrafStub = sandbox.stub(rimraf, 'rimraf').resolves();

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

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectDefaultConfig,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
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

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
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

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
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

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
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

      expect(esbuildStub.calledOnce).to.be.true;
      expect(esbuildStub.firstCall.args[0]).to.eql({
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        outdir: path.join(outdir, path.basename(path.dirname(files[0]))),
      });
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

      expect(esbuildStub.calledOnce).to.be.true;
      sinon.assert.match(esbuildStub.firstCall.args[0], {
        ...expectDefaultConfig,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        watch: {
          onRebuild: sinon.match.func,
        },
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

      await watch(config);

      expect(globStub.called).to.be.false;
      expect(rimrafStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      sinon.assert.match(esbuildStub.firstCall.args[0], {
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: entryPoints.map(entryPoint => `${process.cwd()}/${projectDir}/${entryPoint}`),
        watch: {
          onRebuild: sinon.match.func,
        },
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

      await watch(config);

      expect(rimrafStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      sinon.assert.match(esbuildStub.firstCall.args[0], {
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        watch: {
          onRebuild: sinon.match.func,
        },
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

      await watch(config);

      expect(rimrafStub.called).to.be.false;

      expect(esbuildStub.calledOnce).to.be.true;
      sinon.assert.match(esbuildStub.firstCall.args[0], {
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        watch: {
          onRebuild: sinon.match.func,
        },
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

      expect(esbuildStub.calledOnce).to.be.true;
      sinon.assert.match(esbuildStub.firstCall.args[0], {
        ...expectDefaultConfig,
        ...config.esbuildOptions,
        entryPoints: files,
        outdir: path.join(outdir, path.basename(path.dirname(files[0]))),
        watch: {
          onRebuild: sinon.match.func,
        },
      });
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

      esbuildStub.firstCall.args[0].watch.onRebuild({});

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

      esbuildStub.firstCall.args[0].watch.onRebuild();

      expect(mockLogger.verbose.called).to.be.false;
      expect(mockLogger.warn.called).to.be.false;
      expect(mockLogger.error.called).to.be.false;
      expect(mockLogger.info.calledOnce).to.be.true;
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
