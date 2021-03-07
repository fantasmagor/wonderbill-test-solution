'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noPreserveCache();

const sandbox = sinon.createSandbox();

describe('Queue service', () => {
  let addStub;
  let processStub;
  const bullStub = sandbox.stub();

  // the only way to fully mock the Bull library
  const queue = proxyquire('./index', {
    bull: bullStub
  });

  const name = 'name';

  before(() => {
    addStub = sandbox.stub();
    processStub = sandbox.stub();
    bullStub.returns({
      add: addStub,
      process: processStub
    });
  });

  after(() => {
    sandbox.restore();
  });

  it('should initialize Bull with an expected queue name', async () => {
    queue.get(name);
    expect(bullStub.lastCall.args[0]).to.equal(name);
  });

  it('should call Bull.add() with expected job data', async () => {
    const testJob = { job: '12345' };
    const attempts = 123;
    const delaySeconds = 456;
    queue.get().addJob(testJob, attempts, delaySeconds);
    expect(addStub.lastCall.args)
      .to.deep.equal([testJob, { attempts, backoff: delaySeconds * 1000 }]);
  });

  it('should call Bull.process() with expected worker', async () => {
    const worker = 'worker';
    queue.get().process(worker);
    expect(processStub.lastCall.args[0]).to.equal(worker);
  });
});
