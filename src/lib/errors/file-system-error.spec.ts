import { expect } from 'chai';
import { red } from 'colorette';
import sinon from 'sinon';
import { FileSystemError } from './file-system-error';

describe('FileSystemError', () => {
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
      const error = new FileSystemError('file', 'code');
      expect(error.message).to.equal(red('An error occurred while accessing "file": code.'));
    });

    it('should set correct stacktrace', () => {
      const error = new FileSystemError('file', 'code');
      expect(error.stack).to.equal('ThisIsAStackTrace');
    });

    it('should set correct name', () => {
      const error = new FileSystemError('file', 'code');
      expect(error.name).to.equal('FileSystemError');
    });
  });
});
