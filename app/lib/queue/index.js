'use strict';

const Bull = require('bull');

const get = (name) => {
  const queue = new Bull(name, process.env.REDIS_URL);

  // TODO: argument validation
  return {
    addJob:
      (data, attempts = 10, delaySeconds = 20) => queue
        .add(data, { attempts, backoff: delaySeconds * 1000 }),
    process: (worker) => queue.process(worker)
  };
};

module.exports = {
  get
};
