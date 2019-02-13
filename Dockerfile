# build
FROM node:11.9-alpine as build

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

COPY config.yml config.yml
COPY bin bin
RUN ./bin/build-text-img

# run
FROM alpine:3.9

COPY --from=build /usr/share/fonts /usr/share/fonts
RUN apk add --update --no-cache libstdc++ imagemagick

WORKDIR /opt/app

COPY --from=build /opt/app/build/app ./
COPY --from=build /opt/app/dist dist

COPY config.yml config.yml

ENTRYPOINT ["./app"]
