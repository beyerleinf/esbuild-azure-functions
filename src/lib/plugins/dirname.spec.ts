import { expect } from 'chai';
import { PluginBuild } from 'esbuild';
import fs from 'fs/promises';
import mockFS from 'mock-fs';
import sinon from 'sinon';
import { dirnamePlugin } from './dirname';

const dirnameShim = `
import __import_PATH from 'path';
import __import_URL from 'url'

const __dirname = __import_PATH.dirname(__import_URL.fileURLToPath(import.meta.url));
const __filename = __import_URL.fileURLToPath(import.meta.url);\n`;

describe('DirnamePlugin', () => {
  let sandbox: sinon.SinonSandbox;

  let mockBuild: { onStart: sinon.SinonStub; onEnd: sinon.SinonStub };

  const output1 = 'some/output1.js';
  const output2 = 'some/output2.js';

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    mockFS({
      [output1]: mockFS.file({ content: '' }),
      [output2]: mockFS.file({ content: '' }),
    });

    mockBuild = {
      onStart: sandbox.stub(),
      onEnd: sandbox.stub(),
    };
  });

  afterEach(() => {
    sandbox.restore();
    mockFS.restore();
  });

  it('should insert dirname shim at the top of every output', async () => {
    const args = {
      metafile: {
        outputs: {
          [output1]: {},
          [output2]: {},
        },
      },
    };

    dirnamePlugin().setup({ ...mockBuild, initialOptions: { metafile: true } } as unknown as PluginBuild);

    mockBuild.onStart.firstCall.args[0]();
    await mockBuild.onEnd.firstCall.args[0](args);

    const finalContent1 = await fs.readFile(output1, 'utf8');
    const finalContent2 = await fs.readFile(output2, 'utf8');

    expect(finalContent1).to.eql(dirnameShim);
    expect(finalContent2).to.eql(dirnameShim);
  });

  it('should return error in onStart when metafile is false', async () => {
    const args = {
      metafile: {
        outputs: {
          [output1]: {},
          [output2]: {},
        },
      },
    };

    dirnamePlugin().setup({ ...mockBuild, initialOptions: { metafile: false } } as unknown as PluginBuild);

    const result = mockBuild.onStart.firstCall.args[0]();

    expect(result.errors).to.eql([{ text: 'Metafile must be enabled.' }]);
  });
});
