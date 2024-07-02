FROM node:18.20.3-alpine3.20

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

CMD [ "node", "index.js" ]
