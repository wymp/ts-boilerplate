FROM node:17-alpine3.14

# Update and install git
RUN apk update \
        && apk upgrade \
        && apk add --no-cache git

# Use environment variables to configure
ENV APP_CONFIG_WITH_ENV=true

# Declare that we want to publish port 80
EXPOSE 80

# Create the /app directory and use it as our working dir
RUN mkdir /app
WORKDIR /app

# Copy package.json, install dependencies, copy app files, compile, then chown everything
COPY ./package.json ./package-lock.json ./.npmrc .
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc,required=true npm install
COPY . .
RUN npx tsc && chown -R node:node /app

# Use the node user to execute the app
USER node
ENTRYPOINT [ "/app/docker/container-entrypoint.sh" ]
CMD [ "node", "/app/dist/run/app.js" ]

LABEL org.opencontainers.image.source https://github.com/%{NAMESPACE}/%{PROJECT_NAME}

