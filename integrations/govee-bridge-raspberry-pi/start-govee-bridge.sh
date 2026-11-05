#!/usr/bin/env bash
# Sonic Display V971: local-only Govee LAN bridge for Raspberry Pi OS (64-bit).
set -Eeuo pipefail
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS="$HERE/scripts"
if [[ ! -f "$SCRIPTS/govee-lan-bridge.cjs" ]]; then
  SCRIPTS="$HERE/../../scripts"
fi
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 24 (ARM64) fehlt. Bitte Node.js installieren.' >&2
  exit 1
fi
if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 24 ? 0 : 1)'; then
  echo 'Node.js 24 oder neuer ist erforderlich (64-Bit Raspberry Pi OS empfohlen).' >&2
  exit 1
fi
if [[ ! -f "$SCRIPTS/govee-lan-bridge.cjs" || ! -f "$SCRIPTS/govee-lan-protocol.cjs" ]]; then
  echo 'Die Govee-Bridge-Dateien fehlen. Bitte das komplette Paket entpacken.' >&2
  exit 1
fi
# Existing V910 systemd service and this standalone process must not use port 8765 simultaneously.
# No sudo, no npm, no firewall changes, no external bind address.
exec node "$SCRIPTS/govee-lan-bridge.cjs" "$@"
