import { expect } from 'chai';
import { red } from 'colorette';
import sinon from 'sinon';
import { InvalidJSONError } from './invalid-json-error';

describe('InvalidJSONError', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    sandbox.stub(Error, 'captureStackTrace').callsFake((instance: any) => {
      instance.stack = 'ThisIsAStackTrace';
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should set correct message', () => {
      const error = new InvalidJSONError('file');
      expect(error.message).to.equal(red('The config file "file" does not contain valid JSON.'));
    });

    it('should set correct stacktrace', () => {
      const error = new InvalidJSONError('file');
      expect(error.stack).to.equal('ThisIsAStackTrace');
    });

    it('should set correct name', () => {
      const error = new InvalidJSONError('file');
      expect(error.name).to.equal('InvalidJSONError');
    });
  });
});
