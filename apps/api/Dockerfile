## declare base image - node 20.13
FROM node:22.16 AS builder
#AS builder
ARG PACKAGE_TOKEN
ENV PACKAGE_TOKEN=$PACKAGE_TOKEN

WORKDIR /app
COPY . .

RUN yarn build

FROM node:22.16-alpine
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ARG PACKAGE_TOKEN
ENV PACKAGE_TOKEN=$PACKAGE_TOKEN

WORKDIR /app
COPY --from=builder /apps/dist ./dist
COPY config ./config
COPY .npmrc ./
COPY package.json yarn.lock ./

RUN yarn install --production

RUN ln -snf /usr/share/zoneinfo/Asia/Seoul /etc/localtime

EXPOSE 3000
CMD yarn start:prod