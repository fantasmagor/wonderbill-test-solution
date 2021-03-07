'use strict';

// load required packages
const express = require('express');
const log = require('loglevel');

log.setLevel('info');

// load root endpoint
const index = require('./post/index');

// define port
const port = process.env.LISTENING_PORT;

// instantiate express
const app = express();

// use json as a default in/out format
app.use(express.json());

// use index for the root endpoint
app.post('/', index);

// listening
app.listen(port, () => log.info(`API server listening at http://localhost:${port}`));
