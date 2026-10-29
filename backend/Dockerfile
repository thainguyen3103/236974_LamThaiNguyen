
FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node . .

ENV PORT=5000

EXPOSE 5000

USER node

CMD ["node", "server.js"]
