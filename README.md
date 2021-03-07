## A stack description

#### The solution contains 4 Docker container:
- api - provides the first endpoint (default <http://localhost:3001>), responsible for catching the user data, validating and creating a queue job, which is later processed by consumer
- consumer - responsible for processing request queue jobs, tries to fetch requested data from the provider. Creates a response queue job on success. Rejects on fail (request job is re-processed after a predefined delay).
- responder - responsible for processing response queue jobs, tries to send requested data back to callbackUrl provided by a user. Rejects on fail (response job is re-processed after a predefined delay).
- redis - a database used by the Bull package to store all the queues, not persistent. To make persistent it requires some changes in the docker-compose configuration (add an external volume)

All the node container use pm2 for keeping the code running all the time (it is possible to configure pm2 to use all processor threads);
Pm2 instances have an option watch enabled, it helps to work with the code on running containers. Not necessary in production.

#### data flow:
```
                                    provider
                                       ↕
user ↔ API → [queue:api_requests] → CONSUMER → [queue:api_responses] → RESPONDER ↔ callbackUrl
```

#### Usage:
- ```npm install``` - updates all the dependencies in a postinstall process
- ```npm test``` - starts mocha to test all *.test.js files
- ```npm start``` - updates all the dependencies and fires up all the containers

The default API endpoint is `POST http://localhost:3001/` (if port is not changed in docker-compose.yml)

It accepts POST requests with the body (json):
```{ provider: string, callbackUrl: string }```

The response (json):
```{ requestId: string }```

The responder sends back requested data to `callbackUrl` as (json):
```{ requestId: string, data: object }```

#### Logs
A full process logs are visible in a console after starting the containers. Each request can be tracked by its unique requestId.

#### Problems
In case of any problems please contact me at [arek.jablonski@gmail.com](mailto:arek.jablonski@gmail.com)

---

## Why this stack
I normally don't work with Express (the last I used it was 4 years ago) and Bull queues. In a real life I would prefer to go with AWS services and utilise AWS ApiGateway, AWS Lambda, AWS SQS (or SNS) everything with or without Serverless framework. Although, in this particular case that approach would be a bit of over engineering and harder to run/evaluate.

---
###Have a fun and all the best!

Arkadiusz Jablonski
