import { expect } from 'chai';
import { red } from 'colorette';
import sinon from 'sinon';
import { ZodError, ZodInvalidTypeIssue, ZodIssue } from 'zod';
import { InvalidConfigError } from './invalid-config-error';

describe('InvalidConfigError', () => {
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
    const zodError = new ZodError([
      { code: 'invalid_type', path: ['path', 'to', 'prop'], expected: 'array', received: 'boolean' } as ZodIssue,
      { path: ['path', 'to', 'other', 'prop'] } as ZodIssue,
    ]);

    it('should set correct message', () => {
      const error = new InvalidConfigError(zodError);
      expect(error.message).to.equal(
        red(
          `\nThe config file is invalid. Check the following properties for validity:\n- ${zodError.issues[0].path.join(
            '.'
          )}: Expected ${(zodError.issues[0] as ZodInvalidTypeIssue).expected} but received ${
            (zodError.issues[0] as ZodInvalidTypeIssue).received
          }\n- ${zodError.issues[1].path.join('.')}\n`
        )
      );
    });

    it('should set correct stacktrace', () => {
      const error = new InvalidConfigError(zodError);
      expect(error.stack).to.equal('ThisIsAStackTrace');
    });

    it('should set correct name', () => {
      const error = new InvalidConfigError(zodError);
      expect(error.name).to.equal('InvalidConfigError');
    });
  });
});
