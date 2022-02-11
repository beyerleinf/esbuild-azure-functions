import sinon from 'sinon';
import { expect } from 'chai';
import { build } from './builder';
import * as esbuild from 'esbuild';
import * as configModel from './models/config';

describe('Builder', () => {
  let sandbox: sinon.SinonSandbox;

  let isBuilderConfigStub: sinon.SinonStub;
  let esbuildStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    isBuilderConfigStub = sandbox.stub(configModel, 'isBuilderConfig');
    esbuildStub = sandbox.stub(esbuild, 'build').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('builder', () => {
    it('should', () => {
      expect(true).to.be.true;
    });
  });
});
