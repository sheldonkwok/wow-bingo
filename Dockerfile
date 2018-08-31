FROM node:10.9-alpine as build

WORKDIR /opt/app

RUN apk add --update --no-cache imagemagick msttcorefonts-installer && \
    update-ms-fonts && \
    fc-cache -f

COPY package.json package-lock.json ./
RUN npm install && \
    npm run cache-pkg

COPY src tsconfig.json ./
RUN npm run build

COPY . .
RUN ./bin/build-text-img

FROM alpine:3.8

WORKDIR /opt/app

RUN apk add --update --no-cache imagemagick msttcorefonts-installer && \
    update-ms-fonts && \
    fc-cache -f

COPY --from=build /opt/app/build/app ./
COPY --from=build /opt/app/dist dist

ENTRYPOINT ["./app"]
