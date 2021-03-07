'use strict';

const axios = require('axios');
const log = require('loglevel');

log.setLevel('info');

const worker = async (job) => {
  const { data, callbackUrl, requestId } = job.data;
  log.info(`[${requestId}] Processing data response. Job data:`, job.data);

  try {
    // try to post the requested data back to the initial callbackUrl
    const { status } = await axios.post(callbackUrl, { requestId, data });

    // status 200 or 201 are treated as a success, nothing more to do with this task
    if (status === 200 || status === 201) {
      log.info(`[${requestId}] Success, data is sent to the callbackUrl`);
      log.info(`[${requestId}] The journey is over, home sweet home!!!`);
      return Promise.resolve();
    }

    // treat non 200/201 status as invalid (unlikely but still possible)
    log.info(`[${requestId}] Responded status is not expected 200/201`);
    return Promise.reject(new Error(`Responded status ${status} not expected`));
  } catch (err) {
    // reject, a job will be reprocessed or rejected again based on backoff settings
    log.info(`[${requestId}] Posting to callbackUrl fails, try again later`);
    return Promise.reject(err.message);
  }
};

module.exports = {
  worker
};
