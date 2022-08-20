#!/bin/bash

export APP_VERSION="$(node -p "require('./package.json').version")"
while [ $# -gt 0 ]; do
    case "$1" in
        -v|--version) APP_VERSION="$2"; shift 2;;
        *)
            >&2 echo "E: Unknown option: '$1'"
            exit 1
        ;;
    esac
done

(cd db && ./link-schema.sh)

docker compose -f docker/compose.dev.yml build

if [ "$APP_VERSION" != "dev" ]; then
    docker image tag ghcr.io/%{NAMESPACE}/%{PROJECT_NAME}:$APP_VERSION ghcr.io/%{NAMESPACE}/%{PROJECT_NAME}:dev
    docker image tag ghcr.io/%{NAMESPACE}/%{PROJECT_NAME}:$APP_VERSION ghcr.io/%{NAMESPACE}/%{PROJECT_NAME}:latest
fi
