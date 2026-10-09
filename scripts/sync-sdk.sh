#!/usr/bin/env bash
# Re-copies the typed API client from steppal-core into src/sdk.
#
# The repos are separate on purpose and @steppal/sdk is not published to npm
# yet, so the client is vendored rather than installed. Run this after the API
# changes:
#
#   bash scripts/sync-sdk.sh ../steppal-core
#
# When the SDK is published, delete this script and src/sdk, and add the
# package as a normal dependency.
set -euo pipefail

CORE="${1:-../steppal-core}"
SRC="$CORE/packages/sdk/src"

[ -d "$SRC" ] || { echo "No SDK at $SRC — pass the path to steppal-core"; exit 1; }

mkdir -p src/sdk

for file in types.ts index.ts; do
  {
    echo "/**"
    echo " * VENDORED from steppal-core/packages/sdk — do not edit here."
    echo " * Refresh with: bash scripts/sync-sdk.sh <path-to-steppal-core>"
    echo " */"
    echo
    cat "$SRC/$file"
  } > "src/sdk/$file"
  echo "synced src/sdk/$file"
done

echo "Done. Run npx tsc --noEmit to check nothing drifted."
