#!/bin/bash

mkdir -p db/migrations/{schema,non-prod-common,non-prod,staging,prod}
ln -snf ../schema db/migrations/non-prod-common/schema
ln -snf ../schema db/migrations/prod/schema
ln -snf ../non-prod-common db/migrations/non-prod/non-prod-common
ln -snf ../non-prod-common db/migrations/staging/non-prod-common

if ! [ -e db/shmig.conf ]; then
  {
    echo "TYPE=mysql"
    echo "DATABASE=dev.$(dirname "${PWD%-src}")"
    echo "LOGIN=dev"
    echo "PASSWORD=dev"
    echo "MIGRATIONS="'"'"choose_'prod'_or_'non-prod'_using_the_'-m'_flag"'"'
    echo "RECURSIVE_MIGS=1"
    echo "TIMESTAMP_FORMAT=%Y%m%d_%H%M%S"
  } > db/shmig.conf
fi

if ! [ -e db/shmig.local.conf ]; then
  echo "MIGRATIONS=migrations/non-prod" > db/shmig.local.conf
fi

if ! [ -e db/migrations/schema/*-init.sql ]; then
  cd db
  shmig -m migrations/schema create init
  echo
  echo "Initial migration created. Please add your initial schema"
  echo "to this file."
  echo
  cd ../
fi

if ! [ -e .gitignore ]; then
  touch .gitignore
fi

if ! grep -q 'shmig.local.conf' .gitignore; then
  echo "shmig.local.conf" >> .gitignore
fi
