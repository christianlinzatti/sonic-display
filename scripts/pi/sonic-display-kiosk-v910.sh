#!/usr/bin/env bash
# V910: labwc login session -> Vercel via Chromium kiosk. Never disable the Chromium sandbox.
set -euo pipefail
CONFIG="$HOME/.config/sonic-display/pi-kiosk.env"
if [[ ! -r "$CONFIG" ]]; then echo '[Sonic Display] Kiosk-Konfiguration fehlt.' >&2; exit 1; fi
# Only the per-user installer writes this private configuration.
# shellcheck disable=SC1090
source "$CONFIG"
if [[ ! "${SONIC_DISPLAY_URL:-}" =~ ^https:// ]]; then echo '[Sonic Display] HTTPS-URL fehlt.' >&2; exit 1; fi
if command -v chromium >/dev/null 2>&1; then CHROMIUM="$(command -v chromium)";
elif command -v chromium-browser >/dev/null 2>&1; then CHROMIUM="$(command -v chromium-browser)";
else echo '[Sonic Display] Chromium ist nicht installiert.' >&2; exit 1; fi
mkdir -p "$HOME/.config/sonic-display/chromium-profile" "${XDG_RUNTIME_DIR:-$HOME/.cache}"
LOCK="${XDG_RUNTIME_DIR:-$HOME/.cache}/sonic-display-v910-kiosk.lock"
exec 9>"$LOCK"
if ! flock -n 9; then exit 0; fi
while true; do
  # Prefer waiting for HTTPS connectivity instead of opening a permanent browser error page.
  if command -v curl >/dev/null 2>&1; then
    until curl -sSLI --max-time 8 -o /dev/null "$SONIC_DISPLAY_URL"; do
      echo '[Sonic Display] Vercel momentan nicht erreichbar. Erneuter Versuch ...' >&2
      sleep 10
    done
  fi
  "$CHROMIUM" --kiosk --no-first-run --noerrdialogs --disable-infobars \
    --disable-session-crashed-bubble --start-maximized \
    --user-data-dir="$HOME/.config/sonic-display/chromium-profile" \
    "$SONIC_DISPLAY_URL" || true
  echo '[Sonic Display] Chromium wurde beendet. Neustart ...' >&2
  sleep 6
done
