import { expect } from 'chai';
import { red } from 'colorette';
import sinon from 'sinon';
import { ProjectDirectoryNotFoundError } from './project-directory-not-found';

describe('ProjectDirectoryNotFoundError', () => {
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
      const error = new ProjectDirectoryNotFoundError('dir');
      expect(error.message).to.equal(red('The project directory "dir" could not be found.'));
    });

    it('should set correct stacktrace', () => {
      const error = new ProjectDirectoryNotFoundError('dir');
      expect(error.stack).to.equal('ThisIsAStackTrace');
    });

    it('should set correct name', () => {
      const error = new ProjectDirectoryNotFoundError('dir');
      expect(error.name).to.equal('ProjectDirectoryNotFoundError');
    });
  });
});
