'use strict';

const { expect } = require('chai');
const sinon = require('sinon');
const log = require('loglevel');

const sandbox = sinon.createSandbox();

const validUrl = require('valid-url');
const uuid = require('node-uuid');
const queue = require('../../../lib/queue');

const index = require('./index');
log.disableAll();

describe('Root API controller', () => {
  const provider = 'gas';
  const callbackUrl = 'http://valid.url';
  const requestId = '00000000-0000-0000-0000-000000000000';
  let uuidv4Stub;
  let isWebUriStub;
  let addJobStub;
  let queueMock;
  const resStatusSpy = sandbox.spy();
  const resJSONSpy = sandbox.spy();
  const resMock = {};

  before(() => {
    uuidv4Stub = sandbox.stub(uuid, 'v4');
    addJobStub = sandbox.stub();
    queueMock = sandbox.stub(queue, 'get').returns({ addJob: addJobStub });
    resMock.status = sandbox.stub().callsFake((status) => {
      resStatusSpy(status);
      return resMock;
    });
    resMock.json = sandbox.stub().callsFake((json) => {
      resJSONSpy(json);
      return resMock;
    });
    isWebUriStub = sandbox.stub(validUrl, 'isWebUri');
  });

  beforeEach(() => {
    uuidv4Stub.reset();
    uuidv4Stub.returns(requestId);
    resStatusSpy.resetHistory();
    resJSONSpy.resetHistory();
    isWebUriStub.reset();
    queueMock.resetHistory();
    addJobStub.reset();
  });

  after(() => {
    sandbox.restore();
  });

  it('should return status 400 and according error if empty provider code', () => {
    index({ body: {} }, resMock);
    expect(resStatusSpy.lastCall.args[0]).to.equal(400);
    expect(resJSONSpy.lastCall.args[0].errors).to.deep.include({ message: 'Invalid provider code' });
  });

  it('should return status 400 and according error if invalid provider code', () => {
    index({ body: { provider: 'invalid' } }, resMock);
    expect(resStatusSpy.lastCall.args[0]).to.equal(400);
    expect(resJSONSpy.lastCall.args[0].errors).to.deep.include({ message: 'Invalid provider code' });
  });

  it('should return status 400 and according error if empty callbackUrl', () => {
    index({ body: { provider: 'gas' } }, resMock);
    expect(resStatusSpy.lastCall.args[0]).to.equal(400);
    expect(resJSONSpy.lastCall.args[0].errors).to.deep.include({ message: 'Invalid callbackUrl' });
  });

  it('should return status 400 and according error if invalid callbackUrl', () => {
    isWebUriStub.returns(false);
    index({ body: { provider, callbackUrl } }, resMock);
    expect(resStatusSpy.lastCall.args[0]).to.equal(400);
    expect(resJSONSpy.lastCall.args[0].errors).to.deep.include({ message: 'Invalid callbackUrl' });
  });

  it('should call queue service add with expected data', () => {
    isWebUriStub.returns(true);
    index({ body: { provider, callbackUrl } }, resMock);
    expect(queueMock.lastCall.args[0]).to.equal('api_requests');
    expect(addJobStub.lastCall.args[0]).to.deep.equal({ callbackUrl, provider, requestId });
    expect(resStatusSpy.lastCall.args[0]).to.equal(201);
    expect(resJSONSpy.lastCall.args[0]).to.deep.equal({ requestId });
  });
});
