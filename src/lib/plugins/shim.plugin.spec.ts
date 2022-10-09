import { expect } from 'chai';
import { PluginBuild } from 'esbuild';
import * as sinon from 'sinon';
import { Shim } from '../types/shim';
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

    const shims: Shim[] = [
      {
        imports: [
          { isDefault: true, as: '__import_MODULE', from: 'some content' },
          { isDefault: false, as: '__import_OTHER', from: 'other content' },
        ],
        code: 'console.log("hello world");',
      },
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

    const expectedShim = `import __import_MODULE from 'some content';
import * as __import_OTHER from 'other content';
console.log("hello world");`;

    expect(args.outputFiles).to.eql([
      {
        path: 'some/path/file.js',
        text: [expectedShim, 'initial content'].join('\n'),
      },
      {
        path: 'some/path/file.js.map',
        text: 'initial sourcemap content',
      },
    ]);
  });
});
