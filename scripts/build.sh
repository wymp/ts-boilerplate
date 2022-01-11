#!/bin/bash

set -e

rm -Rf dist &>/dev/null
npx tsc
CONTENT=$(cat dist/index.js)
(
  echo "#!/usr/bin/env node"
  echo "$CONTENT"
) > dist/index.js

chmod +x dist/index.js

