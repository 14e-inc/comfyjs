FROM packages.buildkite.com/hebron-watson/cf-test-devx/node-alpine:20-alpine-0.1.0
LABEL author "Hebron Watson"

WORKDIR /docker-build
COPY package.json /docker-build/
RUN pnpm install

COPY /src /docker-build/
RUN pnpm build

