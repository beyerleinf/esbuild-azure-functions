import { expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mockFS from 'mock-fs';
import sinon from 'sinon';
import { ZodError } from 'zod';
import { loadConfig, parseConfig, parseWatchConfig } from './config-loader';
import { BuilderConfig, BuilderConfigType, WatchConfig } from './models';

chaiUse(chaiAsPromised);

describe('ConfigLoader', () => {
  let sandbox: sinon.SinonSandbox;

  let builderConfigSafeParse: sinon.SinonStub;
  let watchConfigSafeParse: sinon.SinonStub;

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

    builderConfigSafeParse = sandbox.stub(BuilderConfig, 'safeParse');
    watchConfigSafeParse = sandbox.stub(WatchConfig, 'safeParse');

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
      return expect(loadConfig('some/path')).to.eventually.be.rejected;
    });

    it('should throw SyntaxError when file is invalid JSON', () => {
      return expect(loadConfig(configPathNotJson)).to.eventually.be.rejected;
    });
  });

  describe('parseConfig', () => {
    it('should parse config', () => {
      builderConfigSafeParse.returns({ success: true, data: validConfig });

      expect(parseConfig({})).to.eql(validConfig);
    });

    it('should throw InvalidConfigError when safeParse returns error', () => {
      builderConfigSafeParse.returns({ success: false, error: new ZodError([]) });

      expect(() => {
        parseConfig(configPathValid);
      }).to.throw();
    });
  });

  describe('parseWatchConfig', () => {
    it('should parse config', () => {
      watchConfigSafeParse.returns({ success: true, data: validConfig });

      expect(parseWatchConfig({})).to.eql(validConfig);
    });

    it('should throw InvalidConfigError when safeParse returns error', () => {
      watchConfigSafeParse.returns({ success: false, error: new ZodError([]) });

      expect(() => {
        parseWatchConfig(configPathValid);
      }).to.throw();
    });
  });
});
