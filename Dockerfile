# STEP 1: Build Stage
FROM node:22-bullseye AS builder
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV TZ Asia/Seoul

RUN corepack enable && corepack prepare pnpm@10.6.4 --activate


WORKDIR /app/boilerplate
COPY . .
RUN pnpm install
RUN pnpm build
RUN pnpm docker:db:migrate

# STEP 2: Run Stage
FROM node:22-bullseye
ENV NODE_ENV=${NODE_ENV}
ENV TZ Asia/Seoul
WORKDIR /app/boilerplate

RUN corepack enable && corepack prepare pnpm@10.6.4 --activate

# 빌드 단계에서 생성된 production 의존성과 빌드 결과 복사
COPY --from=builder /api/node_modules ./node_modules
COPY --from=builder /api/dist ./dist

COPY package.json pm2.config.js docker.start.sh ./
COPY env ./env

# docker.start.sh 실행 권한 부여 및 pm2 전역 설치
RUN chmod +x ./docker.start.sh && npm install -g pm2

EXPOSE 8000
CMD ["./docker.start.sh"]


