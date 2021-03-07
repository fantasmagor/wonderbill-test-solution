FROM node:14

COPY responder/package*.json /app/responder/
COPY responder/app.json /app/responder/

RUN apt update
RUN apt -y upgrade

WORKDIR /app/responder
RUN npm install
RUN npm install pm2 -g
