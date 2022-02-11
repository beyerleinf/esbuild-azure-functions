import { expect } from 'chai';
import * as td from 'testdouble';
import { isBuilderConfig } from './config';

describe('BuilderConfig', () => {
  let logLevelModelMock: any;

  beforeEach(async () => {
    logLevelModelMock = await td.replaceEsm('./loglevel');
    console.log(logLevelModelMock);
  });

  afterEach(() => {
    td.reset();
  });

  describe('isBuilderConfig', () => {
    it('should return false when arg is undefined', () => {
      expect(isBuilderConfig(undefined)).to.be.false;
    });

    it('should return false when arg is null', () => {
      expect(isBuilderConfig(null)).to.be.false;
    });

    it('should return false when arg.project is undefined', () => {
      const config = {};

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.project is null', () => {
      const config = {
        project: null,
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.project is not a string', () => {
      const config = {
        project: 123,
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.clean is not a boolean', () => {
      const config = {
        project: 'test',
        clean: 123,
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.entryPoints is not an array', () => {
      const config = {
        project: 'test',
        entryPoints: 123,
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.entryPoints is not an array of strings', () => {
      const config = {
        project: 'test',
        entryPoints: [123],
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.exclude is not an array', () => {
      const config = {
        project: 'test',
        exclude: 123,
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when arg.exclude is not an array of strings', () => {
      const config = {
        project: 'test',
        exclude: [123],
      };

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return false when isBuilderLogLevel returns false', () => {
      const config = {
        project: 'test',
        loglevel: 'test',
      };

      td.when(logLevelModelMock.isBuilderLogLevel(config.loglevel)).thenReturn(false);
      td.verify(logLevelModelMock.isBuilderLogLevel(config.loglevel), { times: 1 });

      expect(isBuilderConfig(config)).to.be.false;
    });

    it('should return true when arg is correct', () => {
      const config = {
        project: 'test',
        exclude: ['abc'],
        entryPoints: ['abc'],
        clean: true,
      };

      expect(isBuilderConfig(config)).to.be.true;
    });
  });
});
