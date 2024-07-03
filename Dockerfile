FROM node:20.15.0-alpine3.20

RUN mkdir -p /app/node_modules && chown -R node:node /app

WORKDIR /app

COPY package*.json ./

RUN addgroup node dialout

USER node

RUN npm install

COPY --chown=node:node . .

CMD [ "node", "index.js" ]
