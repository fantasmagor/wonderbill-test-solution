FROM node:14

COPY consumer/package*.json /app/consumer/
COPY consumer/app.json /app/consumer/

RUN apt update
RUN apt -y upgrade

WORKDIR /app/consumer
RUN npm install
RUN npm install pm2 -g
