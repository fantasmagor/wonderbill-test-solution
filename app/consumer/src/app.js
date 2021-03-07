'use strict';

const queue = require('../../lib/queue');
const { worker } = require('./worker');

// get the requests queue and assign a worker
queue.get('api_requests').process(worker);
