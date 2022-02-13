// import { expect } from 'chai';
// import sinon from 'sinon';
// import { isBuilderConfig } from './config';
// import * as logLevelModel from './loglevel';

// describe('BuilderConfig', () => {
//   let sandbox: sinon.SinonSandbox;

//   let isBuilderLogLevelStub: sinon.SinonStub;

//   beforeEach(async () => {
//     sandbox = sinon.createSandbox();

//     isBuilderLogLevelStub = sandbox.stub(logLevelModel, 'isBuilderLogLevel').returns(true);
//   });

//   afterEach(() => {
//     sandbox.restore();
//   });

//   describe('isBuilderConfig', () => {
//     it('should return false when arg is undefined', () => {
//       expect(isBuilderConfig(undefined)).to.be.false;
//     });

//     it('should return false when arg is null', () => {
//       expect(isBuilderConfig(null)).to.be.false;
//     });

//     it('should return false when arg.project is undefined', () => {
//       const config = {};

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.project is null', () => {
//       const config = {
//         project: null,
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.project is not a string', () => {
//       const config = {
//         project: 123,
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.clean is not a boolean', () => {
//       const config = {
//         project: 'test',
//         clean: 123,
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.entryPoints is not an array', () => {
//       const config = {
//         project: 'test',
//         entryPoints: 123,
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.entryPoints is not an array of strings', () => {
//       const config = {
//         project: 'test',
//         entryPoints: [123],
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.exclude is not an array', () => {
//       const config = {
//         project: 'test',
//         exclude: 123,
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when arg.exclude is not an array of strings', () => {
//       const config = {
//         project: 'test',
//         exclude: [123],
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return false when isBuilderLogLevel returns false', () => {
//       isBuilderLogLevelStub.returns(false);

//       const config = {
//         project: 'test',
//         loglevel: 'test',
//       };

//       expect(isBuilderConfig(config)).to.be.false;
//     });

//     it('should return true when arg is correct', () => {
//       const config = {
//         project: 'test',
//         exclude: ['abc'],
//         entryPoints: ['abc'],
//         clean: true,
//       };

//       expect(isBuilderConfig(config)).to.be.true;
//     });
//   });
// });
