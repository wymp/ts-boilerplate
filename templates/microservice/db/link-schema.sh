#!/bin/bash

if [ -d "./db" ]; then
  cd "./db"
fi

if [ ! -d "./migrations" ]; then
  >&2 echo "E: You must run this script from either repo root or from the ./db directory"
  exit 1
fi
cd ./migrations

# Now we're in /db/migrations

for F in schema/*.js; do
  base="$(basename -s ".js" "$F")"
  if [ "$base" = "*.js" ]; then
      continue
  fi
  for D in *; do
    if echo "$D" | grep -q "^\." || [ "$D" = "schema" ]; then
      continue
    fi

    echo "Linking $base into environment '$D'"
    (
      cd "$D"
      ln -snf "../$F" ./

      if [ -e "../schemas/sqls/$base-up.sql" ]; then
        mkdir -p sqls
        cd sqls
        ln -snf ../../schema/sqls/"$base-up.sql" ./
        ln -snf ../../schema/sqls/"$base-down.sql" ./
      fi
    )
  done
done
