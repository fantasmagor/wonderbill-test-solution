'use strict';

const { expect } = require('chai').use(require('chai-as-promised'));
const sinon = require('sinon');
const log = require('loglevel');

const sandbox = sinon.createSandbox();

const axios = require('axios');
const queue = require('../../lib/queue');

const { worker } = require('./worker');
log.disableAll();

describe('Consumer worker', () => {
  process.env.PROVIDER_URL = 'provider-url';
  const data = { data: '12345' };
  const provider = 'provider';
  const callbackUrl = 'http://valid.url';
  const requestId = '00000000-0000-0000-0000-000000000000';
  let queueMock;
  let addJobStub;
  let axiosGetStub;

  before(() => {
    addJobStub = sandbox.stub();
    queueMock = sandbox.stub(queue, 'get').returns({ addJob: addJobStub });
    axiosGetStub = sandbox.stub(axios, 'get');
  });

  beforeEach(() => {
    queueMock.resetHistory();
    addJobStub.reset();
    axiosGetStub.reset();
    axiosGetStub.resolves({ status: 200, data });
  });

  after(() => {
    sandbox.restore();
  });

  it('should call axios.get with expected data', async () => {
    await expect(worker({ data: { provider } })).to.not.be.rejected;
    expect(axiosGetStub.lastCall.args[0]).to.deep.equal(`${process.env.PROVIDER_URL}/providers/${provider}`);
  });

  it('should call queue.addJob with expected data if status is 200', async () => {
    await expect(worker({ data: { provider, callbackUrl, requestId } })).to.not.be.rejected;
    expect(queueMock.lastCall.args[0]).to.equal('api_responses');
    expect(addJobStub.lastCall.args[0]).to.deep.equal({ data, callbackUrl, requestId });
  });

  it('should reject if axios.get returns status !== 200', async () => {
    const status = 500;
    axiosGetStub.returns({ status });
    await expect(worker({ data: {} })).to.be.rejectedWith(`Responded status ${status} not expected`);
  });

  it('should reject if axios.get rejects', async () => {
    axiosGetStub.rejects(new Error('fail'));
    await expect(worker({ data: {} })).to.be.rejectedWith('fail');
  });
});
