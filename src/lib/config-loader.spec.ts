import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockFS from 'mock-fs';
import sinon from 'sinon';
import { ZodError } from 'zod';
import { loadConfig, parseConfig } from './config-loader';
import { FileSystemError, InvalidConfigError, InvalidJSONError } from './errors';
import { BuilderConfig, BuilderConfigType } from './models';

chaiUse(chaiAsPromised);

describe('ConfigLoader', () => {
  let sandbox: sinon.SinonSandbox;

  let zodSafeParseStub: sinon.SinonStub;

  const configPathValid = '/my/valid-config.json';
  const configPathNotJson = '/my/not.json';

  const validConfig: BuilderConfigType = {
    project: 'my-project',
    entryPoints: ['EntryPoint1'],
    exclude: ['Exclude1'],
    clean: true,
    logLevel: 'warn',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    zodSafeParseStub = sandbox.stub(BuilderConfig, 'safeParse');

    mockFS({
      [configPathValid]: JSON.stringify(validConfig),
      [configPathNotJson]: 'test',
    });
  });

  afterEach(() => {
    sandbox.restore();

    mockFS.restore();
  });

  describe('loadConfig', () => {
    it('should load config', async () => {
      const result = await loadConfig(configPathValid);

      expect(result).to.eql(validConfig);
    });

    it('should throw FileNotFound error when the file could not be found', () => {
      return expect(loadConfig('some/path')).to.eventually.be.rejectedWith(FileSystemError);
    });

    it('should throw SyntaxError when file is invalid JSON', () => {
      return expect(loadConfig(configPathNotJson)).to.eventually.be.rejectedWith(InvalidJSONError);
    });
  });

  describe('parseConfig', () => {
    it('should parse config', () => {
      zodSafeParseStub.returns({ success: true, data: validConfig });

      expect(parseConfig({})).to.eql(validConfig);
    });

    it('should throw InvalidConfigError when safeParse returns error', () => {
      zodSafeParseStub.returns({ success: false, error: new ZodError([]) });

      expect(() => {
        parseConfig(configPathValid);
      }).to.throw(InvalidConfigError);
    });
  });
});
