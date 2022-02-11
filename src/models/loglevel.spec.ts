import { expect } from 'chai';
import { isBuilderLogLevel } from './loglevel';

describe('BuilderLogLevel', () => {
  describe('isBuilderLogLevel', () => {
    it('should return false when arg is undefined', () => {
      expect(isBuilderLogLevel(undefined)).to.be.false;
    });

    it('should return false when arg is null', () => {
      expect(isBuilderLogLevel(null)).to.be.false;
    });

    it('should return false when arg is not a string', () => {
      expect(isBuilderLogLevel(123)).to.be.false;
    });

    it('should return false when arg is some string', () => {
      expect(isBuilderLogLevel('123')).to.be.false;
    });

    const validLogLevels = ['verbose', 'info', 'warn', 'error'];
    for (const logLevel of validLogLevels) {
      it(`should return true when arg is ${logLevel}`, () => {
        expect(isBuilderLogLevel(logLevel)).to.be.true;
      });
    }
  });
});
