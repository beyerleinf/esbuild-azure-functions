import { expect } from 'chai';
import { Message, PluginBuild } from 'esbuild';
import mockFS from 'mock-fs';
import * as sinon from 'sinon';
import * as logger from '../helper/logger';
import fs from 'fs/promises';
import { onRebuildPlugin } from './on-rebuild.plugin';

const projectDir = 'my/project';

describe('OnRebuildPlugin', () => {
  let sandbox: sinon.SinonSandbox;

  let mockBuild: { onEnd: sinon.SinonStub };

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

    sandbox.stub(logger, 'createLogger').returns(mockLogger);

    mockBuild = {
      onEnd: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
    mockFS.restore();
  });

  it('should call callback onEnd', async () => {
    const initialOptions = {};

    const callback = sandbox.stub();

    onRebuildPlugin({ callback }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    const args = {
      errors: [],
      outputFiles: [
        {
          path: 'some/path/file.js',
          get text() {
            return 'initial content';
          },
        },
        {
          path: 'some/path/file.js.map',
          get text() {
            return 'initial sourcemap content';
          },
        },
      ],
    };

    await mockBuild.onEnd.firstCall.args[0](args);

    expect(callback.calledOnce).to.be.true;
    expect(callback.firstCall.args[0]).to.eql(args);
  });

  it('should write output files', async () => {
    const initialOptions = {};

    const callback = sandbox.stub();

    onRebuildPlugin({ callback }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    const args = {
      errors: [],
      outputFiles: [
        {
          path: 'some/path/file.js',
          get text() {
            return 'initial content';
          },
        },
        {
          path: 'some/path/file.js.map',
          get text() {
            return 'initial sourcemap content';
          },
        },
      ],
    };

    await mockBuild.onEnd.firstCall.args[0](args);

    const output1 = await fs.readFile('some/path/file.js', 'utf8');
    const output2 = await fs.readFile('some/path/file.js.map', 'utf8');

    expect(output1).to.eql('initial content');
    expect(output2).to.eql('initial sourcemap content');

    expect(mockLogger.verbose.called).to.be.false;
    expect(mockLogger.info.called).to.be.true;
    expect(mockLogger.warn.called).to.be.false;
    expect(mockLogger.error.calledOnce).to.be.false;
  });

  it('should call logger.error when build fails', async () => {
    const initialOptions = {};

    const callback = sandbox.stub();

    onRebuildPlugin({ callback }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    const args = {
      errors: [{} as Message],
    };

    await mockBuild.onEnd.firstCall.args[0](args);

    expect(mockLogger.verbose.called).to.be.false;
    expect(mockLogger.info.called).to.be.false;
    expect(mockLogger.warn.called).to.be.false;
    expect(mockLogger.error.calledOnce).to.be.true;
  });

  it('should not throw when outputFiles is undefined', async () => {
    const initialOptions = {};

    const callback = sandbox.stub();

    onRebuildPlugin({ callback }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    const args = {
      errors: [],
    };

    await mockBuild.onEnd.firstCall.args[0](args);
  });
});
