FROM node:current-alpine3.19

USER node 

WORKDIR /usr/src/bot

COPY package.json .
RUN npm install

COPY . .

HEALTHCHECK --interval=30s CMD netstat -lnt | grep :3000

LABEL name="truth-or-dare-bot"

CMD ["node", "index.js"]