#!/bin/sh

set -euo pipefail

# Convert secrets from files into corresponding environment variables
if [ -d /run/secrets ]; then
  for FILE in /run/secrets/*; do
    NM="$(basename "$FILE")"
    if echo "$NM" | grep -Eq "__[0-9]+$"; then
        NM="$(echo "$NM" | sed -r "s/__[0-9]+$//g")"
    fi
    export "$NM"="$(cat "$FILE")"
  done
fi

# Set APP_ENV to dev if not set
if [ -z ${APP_ENV+x} ]; then
  APP_ENV=dev
fi

# If we're explicitly being asked to run migrations, then this is a "migrations container". Just do
# that and exit
if [ "$1" = "db-migrate" ]; then
  echo "Migration container - running db migrations"
  cd /app

  # If we've passed a simple version of the command, adorn it with the proper profiling stuff
  if echo "$@" | grep -Eq "^db-migrate ([a-z]+)( .+)?$"; then
    # Get the migrations dir and cmd
    migs="$( ([ "$APP_ENV" = "prod" ] || [ "$APP_ENV" = "staging" ]) && echo "$APP_ENV" || echo "dev" )"
    cmd="$2"
    # Remove the first two arguments
    shift 2
    # Run the command
    npx db-migrate "$cmd:$migs" "$@"
  else
    # Otherwise, just pass it whole to npx
    npx "$@"
  fi

  echo "Database migrations successfully run"
  exit
else
  # If not in prod or staging, run database migrations on startup
  if [ "$APP_ENV" != "prod" ] && [ "$APP_ENV" != "staging" ]; then
    echo "${APP_ENV} environment - running db migrations"
    (
      cd /app
      npx db-migrate up:dev
    )
  fi
fi

exec "$@"


