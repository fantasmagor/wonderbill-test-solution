'use strict';

const { expect } = require('chai').use(require('chai-as-promised'));
const sinon = require('sinon');
const log = require('loglevel');

const sandbox = sinon.createSandbox();

const axios = require('axios');

const { worker } = require('./worker');
log.disableAll();

describe('Responder worker', () => {
  const data = { data: '12345' };
  const callbackUrl = 'http://valid.url';
  const requestId = '00000000-0000-0000-0000-000000000000';
  let axiosPostStub;

  before(() => {
    axiosPostStub = sandbox.stub(axios, 'post');
  });

  beforeEach(() => {
    axiosPostStub.reset();
    axiosPostStub.resolves({ status: 200, data });
  });

  after(() => {
    sandbox.restore();
  });

  it('should call axios.get with expected data', async () => {
    await expect(worker({ data: { callbackUrl, data } })).to.not.be.rejected;
    expect(axiosPostStub.lastCall.args[0]).to.deep.equal(callbackUrl, { requestId, data });
  });

  it('should resolve if status is 200', async () => {
    axiosPostStub.resolves({ status: 200 });
    await expect(worker({ data: {} })).to.not.be.rejected;
  });

  it('should resolve if status is 201', async () => {
    axiosPostStub.resolves({ status: 201 });
    await expect(worker({ data: {} })).to.not.be.rejected;
  });

  it('should reject if axios.post returns status !== 200', async () => {
    const status = 500;
    axiosPostStub.returns({ status });
    await expect(worker({ data: {} })).to.be.rejectedWith(`Responded status ${status} not expected`);
  });

  it('should reject if axios.post rejects', async () => {
    axiosPostStub.rejects(new Error('fail'));
    await expect(worker({ data: {} })).to.be.rejectedWith('fail');
  });
});
