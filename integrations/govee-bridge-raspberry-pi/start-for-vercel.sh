#!/usr/bin/env bash
# Exact HTTPS origin only. No wildcard and no remote bridge bind.
set -Eeuo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ $# -gt 0 ]]; then
  ORIGIN="$1"
else
  read -r -p 'Öffentliche Sonic-Display-HTTPS-Origin (z. B. https://app.vercel.app): ' ORIGIN
fi
if [[ ! "$ORIGIN" =~ ^https://[a-zA-Z0-9.-]+(:[0-9]{1,5})?$ ]]; then
  echo 'Ungültige Origin. Nur https://HOST ohne Pfad/Query, Port optional.' >&2
  exit 1
fi
exec "$HERE/start-govee-bridge.sh" --origin "$ORIGIN"
