# build
FROM node:12.14-alpine3.11 as build

WORKDIR /opt/app

RUN apk add --update --no-cache imagemagick \
                                msttcorefonts-installer && \
    update-ms-fonts && \
    fc-cache -f

COPY package.json package-lock.json ./
RUN npm install && \
    npm run cache-pkg

COPY src tsconfig.json ./
RUN npm run build

COPY bin bin
COPY config.yaml config.yaml

RUN ./bin/build-text-img

# run
FROM alpine:3.11

COPY --from=build /usr/share/fonts /usr/share/fonts
RUN apk add --update --no-cache libstdc++ imagemagick

WORKDIR /opt/app

COPY --from=build /opt/app/build/app ./
COPY --from=build /opt/app/dist dist

COPY config.yaml config.yaml

ENTRYPOINT ["./app"]
