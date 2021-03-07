FROM node:14

COPY api/package*.json /app/api/
COPY api/app.json /app/api/

RUN apt update
RUN apt -y upgrade

WORKDIR /app/api
RUN npm install
RUN npm install pm2 -g
