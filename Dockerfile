# STEP 1: Build Stage
FROM node:20.10.0-alpine3.18 AS builder
ARG NODE_ENV

ENV NODE_ENV=${NODE_ENV}
ENV TZ Asia/Seoul
RUN npm install -g pnpm

WORKDIR /app/boilerplate
COPY . .
RUN pnpm install
RUN pnpm build
RUN pnpm docker:db:migrate

# STEP 2: Run Stage
FROM node:20.10.0-alpine3.18
ENV NODE_ENV=${NODE_ENV}
ENV TZ Asia/Seoul
WORKDIR /app/boilerplate
COPY --from=builder /app/boilerplate/dist ./dist

COPY env ./env
COPY package.json .
COPY pnpm-lock.yaml .
COPY pm2.config.js .
COPY docker.start.sh .

RUN chmod +x ./docker.start.sh
RUN npm install -g pnpm
RUN npm install pm2 -g
RUN pnpm install --production

EXPOSE 3000
CMD ["./docker.start.sh"]


