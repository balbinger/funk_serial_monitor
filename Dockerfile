FROM node:20

RUN mkdir -p /app/node_modules

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]
