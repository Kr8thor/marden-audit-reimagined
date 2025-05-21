FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci && npm run build

EXPOSE 9090

CMD ["node", "server.cjs"]