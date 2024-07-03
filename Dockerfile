FROM node:20.15.0-alpine3.20

RUN mkdir -p /app/node_modules

WORKDIR /app

COPY package*.json ./

RUN npm install

CMD [ "node", "index.js" ]
