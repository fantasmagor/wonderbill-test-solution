'use strict';

const validUrl = require('valid-url');
const uuid = require('node-uuid');
const log = require('loglevel');
log.setLevel('info');

// load queue service
const queue = require('../../../lib/queue');

/**
 * @swagger
 * /:
 *  post:
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              provider:
 *                type: string
 *              callbackUrl:
 *                type: string
 *          example:
 *            provider: gas
 *            callbackUrl: http://example.com:8080
 *    description: "The main endpoint"
 *    responses:
 *      201:
 *        description: "Success"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *                properties:
 *                  requestId:
 *                    type: string
 *                    example: 92599c3a-b6ec-462c-997f-d254bcbf4525
 *      400:
 *        description: "Validation error"
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errors:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      message:
 *                        type: string
 *      500:
 *        description: Internal error
 */
const index = (req, res) => {
  // generate requestId (used in the whole process for request identification)
  const requestId = uuid.v4();
  log.info(`[${requestId}] Starting a journey, off we go!!!`);
  log.info(`[${requestId}] Post data:`, req.body);

  const { provider, callbackUrl } = req.body;
  const errors = [];

  // validate
  if (!['gas', 'internet'].includes(provider)) {
    errors.push({ message: 'Invalid provider code' });
  }

  if (!validUrl.isWebUri(callbackUrl)) {
    errors.push({ message: 'Invalid callbackUrl' });
  }

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  // add request to the requests queue and return 201
  queue.get('api_requests').addJob({ provider, callbackUrl, requestId });
  return res.status(201).json({
    requestId
  });
};

module.exports = index;
