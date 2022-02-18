import { expect } from 'chai';
import { red } from 'colorette';
import sinon from 'sinon';
import { NoEntryPointsError } from './no-entry-points-error';

describe('NoEntryPointsError', () => {
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
      const error = new NoEntryPointsError('dir');
      expect(error.message).to.equal(
        red(`
      The project directory "dir" did not contain any entry points and none were supplied.
      Make sure your project contains at least one index.ts file
      or supply entry points manually through config.entryPoints.`)
      );
    });

    it('should set correct stacktrace', () => {
      const error = new NoEntryPointsError('dir');
      expect(error.stack).to.equal('ThisIsAStackTrace');
    });

    it('should set correct name', () => {
      const error = new NoEntryPointsError('dir');
      expect(error.name).to.equal('NoEntryPointsError');
    });
  });
});
