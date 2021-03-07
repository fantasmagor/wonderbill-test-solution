'use strict';

const queue = require('../../lib/queue');
const { worker } = require('./worker');

// get the responses queue and assign a worker
queue.get('api_responses').process(worker);
