#!/usr/bin/env bash
# Authenticated, read-only /health call. No lamp commands.
set -Eeuo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS="$HERE/scripts"
if [[ ! -f "$SCRIPTS/govee-bridge-check-v971.cjs" ]]; then
  SCRIPTS="$HERE/../../scripts"
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js fehlt.' >&2
  exit 1
fi
exec node "$SCRIPTS/govee-bridge-check-v971.cjs"
