FROM node:22.16-alpine

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/client/package.json ./apps/client/package.json
COPY packages/api-types/package.json ./packages/api-types/package.json

RUN yarn install --immutable

COPY apps/api/config ./apps/api/config
COPY apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api

RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

EXPOSE 3000
EXPOSE 80

CMD ["sh", "-c", "rm -f .env && node dist/scripts/generateEnv.js && node dist/src/main"]
