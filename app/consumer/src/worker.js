'use strict';

const axios = require('axios');
const queue = require('../../lib/queue');
const log = require('loglevel');

log.setLevel('info');

const worker = async (job) => {
  const { provider, callbackUrl, requestId } = job.data;
  log.info(`[${requestId}] Processing. Job data:`, job.data);

  try {
    // try to fetch a data from provider
    const { status, data } = await axios.get(`${process.env.PROVIDER_URL}/providers/${provider}`);

    // create a response job in the responses queue on success (with returned data)
    if (status === 200) {
      log.info(`[${requestId}] Success, data queued to be send back to callbackUrl`);
      queue.get('api_responses').addJob({ data, callbackUrl, requestId });
      return Promise.resolve();
    }

    // treat non 200 status as invalid (unlikely but still possible)
    log.info(`[${requestId}] Responded status is not expected 200`);
    return Promise.reject(new Error(`Responded status ${status} not expected`));
  } catch (err) {
    // reject, a job will be reprocessed or rejected again based on backoff settings
    log.info(`[${requestId}] Provider fails, try again later`);
    return Promise.reject(err.message);
  }
};

module.exports = {
  worker
};
