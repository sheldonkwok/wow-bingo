FROM node:10.9-alpine as build

WORKDIR /opt/app

COPY package.json package-lock.json ./
RUN npm install

COPY src tsconfig.json ./
RUN npm run build && \
    npm prune --production

FROM node:10.9-alpine

WORKDIR /opt/app

RUN apk add --update --no-cache imagemagick msttcorefonts-installer && \
    update-ms-fonts && \
    fc-cache -f

COPY --from=build /opt/app /opt/app
COPY . .

RUN ./bin/build-text-img
