# Sonic Display V971 – Govee LAN Bridge für Raspberry Pi OS

## Voraussetzungen

- Raspberry Pi mit **Raspberry Pi OS 64-bit** (für die grafische Kiosk-Variante Desktop) und **Node.js 24 ARM64** im PATH (`node --version`). Die Bridge verwendet nur Node-Bordmittel; kein `npm install` nötig.
- LAN-kompatible Govee-Lampen im **selben lokalen Netzwerk**, in der Govee-App **LAN Control** einschalten. UDP 4001 (Suche), 4002 (Antwort), 4003 (Befehle) im LAN zulassen.
- **Die Bridge bindet nur an `127.0.0.1:8765`**, sie wird nicht im Netzwerk/Internet freigegeben. Daher muss Chromium mit Sonic Display auf **demselben Raspberry Pi** laufen. Bei externem Browser nur einen bewusst eingerichteten SSH-Tunnel auf den lokalen Port verwenden, keine offenen Router-Ports.

## Direkt starten (ohne Dienstinstallation)

```bash
cd SonicDisplay-Govee-LAN-Bridge-RaspberryPi-V971
bash start-govee-bridge.sh
# Wenn die Sonic-Display-Seite von Vercel kommt:
bash start-for-vercel.sh https://deine-app.vercel.app
```

**Nur eines** der zwei Startskripte gleichzeitig ausführen. Die exakte öffentliche HTTPS-Origin muss zur geöffneten Webseite passen (kein Slash/Pfad). **Keine** Anmeldung, Cloud/API-ID oder pauschaler LAN-Zugriff wird durch das Script eingerichtet. Den Startprozess geöffnet lassen.

In einem **zweiten Terminal**:

```bash
bash check-bridge.sh  # Nur GET /health, schaltet keine Lampen
bash show-token.sh    # Zeigt vertrauliches Token nur auf bewusste Anforderung
```

Bridge-Token in **Sonic Display → Einstellungen → Govee LAN** eintragen. Bridge-Adresse auf `http://127.0.0.1:8765` lassen. **Bridge-Verbindung prüfen**, **Leuchten im LAN suchen**, Lampen auswählen, erst anschließend Musik-Sync bewusst aktivieren. Token niemals in GitHub, Screenshots oder Chat veröffentlichen. Es liegt in `~/.sonic-display/govee-bridge-token` (Dateirechte 0600).

## Bereits die V910-Pi-Kiosk-Installation verwendet?

Der bestehende Gesamtprojekt-Installer `node scripts/pi/install-v910.cjs --url https://deine-app.vercel.app` richtet bereits einen **systemd-Benutzerdienst** und optional den Chromium-Kiosk auf Raspberry Pi OS mit Desktop/labwc ein. **Dann kein zusätzliches `start-govee-bridge.sh` starten**, da beide denselben Port verwenden. Prüfen mit:

```bash
systemctl --user status sonic-govee-bridge-v910.service
node scripts/govee-bridge-check-v971.cjs
node scripts/print-govee-token-v971.cjs
```

Der V910-Installer verändert die Benutzerdienst-/Kiosk-Konfiguration erst, wenn du ihn explizit aufrufst. Das V971-Standalone-Paket installiert **keinen** Dienst, ändert keine Firewall und startet nicht automatisch beim Boot.

## Häufige Probleme

- `EADDRINUSE`: V910-Dienst oder ein anderer Bridge-Prozess läuft schon. **Keine zweite Bridge** starten.
- Keine Geräte gefunden: LAN Control nicht aktiv, Gast-WLAN/Client-Isolation, unterschiedliche Subnetze oder Govee-Modell ohne LAN-Unterstützung.
- Fehler `401`: Token nur über `show-token.sh` lokal anzeigen und korrekt in der Web-App eingeben.
- Fehler `Origin nicht freigegeben`: `start-for-vercel.sh` mit exakter HTTPS-Origin verwenden.
- Der Browser muss je nach Version den Zugriff auf das lokale Netzwerk/Loopback bewusst erlauben. Kein Abschalten von Browser-Sicherheitsfunktionen empfohlen.
- Gerät über LAN gefunden heißt nicht, dass ein gesendeter UDP-Farb-/Power-Befehl bestätigt wurde; die Bridge bietet nur ein lokales Best-Effort-Protokoll.

**Alexa:** Der deutsche Skill und die Lambda-Funktion sind im **Gesamtprojekt** unter `integrations/alexa/` enthalten. Der Skill wird nicht automatisch in Amazon/AWS eingerichtet. Alexa-Govee-Steuerung erfordert separate Freigabe und bereits aktive Musik-Synchronisation. **Kein Spotify-Sprachsteuerungszugang.**
