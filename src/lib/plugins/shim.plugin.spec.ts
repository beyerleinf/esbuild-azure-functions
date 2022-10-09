import { expect } from 'chai';
import { PluginBuild } from 'esbuild';
import * as sinon from 'sinon';
import { shimPlugin } from './shim.plugin';

describe('ShimPlugin', () => {
  let sandbox: sinon.SinonSandbox;

  let mockBuild: { onEnd: sinon.SinonStub };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockBuild = {
      onEnd: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set options.write to false', () => {
    const initialOptions = {
      write: true,
    };

    shimPlugin({ shims: [] }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    expect(initialOptions.write).to.be.false;
  });

  it('should insert shims', () => {
    const initialOptions = {
      write: true,
    };

    const shims: string[] = [
      "import module as __import_MODULE from 'module'; some content; ",
      "import other as __import_OTHER from 'other'; other content; ",
    ];

    shimPlugin({ shims }).setup({ ...mockBuild, initialOptions } as unknown as PluginBuild);

    const args = {
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

    mockBuild.onEnd.firstCall.args[0](args);

    expect(args.outputFiles).to.eql([
      {
        path: 'some/path/file.js',
        text: [shims.join('\n'), 'initial content'].join('\n'),
      },
      {
        path: 'some/path/file.js.map',
        text: 'initial sourcemap content',
      },
    ]);
  });
});
