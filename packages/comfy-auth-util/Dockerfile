FROM packages.buildkite.com/hebron-watson/cf-test-devx/node-alpine:20-alpine-0.1.0
LABEL author "Hebron Watson"
LABEL app "COMFY AUTH UTIL"

WORKDIR /docker-build
COPY package.json /docker-build/
COPY rollup.config.js ./
COPY tsconfig.json ./

RUN pnpm install
COPY /src ./
COPY . ./

RUN pnpm build
RUN pnpm test

