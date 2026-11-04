# V910 – Raspberry Pi Vercel Kiosk & Govee LAN AutoStart

## Zielarchitektur

- **Vercel:** Hostet die Next.js-App. Der Pi muss weder `next build` ausführen noch die React-/Next.js-Abhängigkeiten installieren.
- **Raspberry Pi OS (64-Bit, Desktop/labwc):** Zeigt die **HTTPS**-Vercel-App im Chromium-Kiosk mit einer eigenen, persistenten Browser-Profildatenbank an.
- **Lokale Bridge:** Läuft als `systemd --user`-Dienst auf **demselben Pi** wie der Chromium-Browser. HTTP nur auf `127.0.0.1:8765`, Govee über WLAN-UDP 4001/4002/4003.
- **Govee:** H6063, H610B, H61A2, H6051: Jedes Gerät einzeln in der Govee-Home-App auf vorhandene **LAN Control**-Option prüfen. Nicht jedes Firmware-/Regions-Setup ermöglicht die LAN-Steuerung, und die aktuelle API erlaubt keine individuellen RGBIC-Segmente.

**Kein Port-Forwarding am Router!** Vercel kann Geräte in deinem WLAN nicht direkt ansprechen; `127.0.0.1` muss aus Chromium **auf dem Pi selbst** verwendet werden. Wenn du die Vercel-Seite auf dem Handy öffnest, verweist `127.0.0.1` auf das Handy, nicht auf die Pi-Bridge.

## Einmalige Einrichtung auf dem Raspberry Pi

1. **Raspberry Pi OS (64-bit, Desktop)** installieren und das Pi-Benutzerkonto anlegen. WLAN muss mit den Govee-Leuchten kommunizieren dürfen (kein isoliertes Gastnetz). Pi sollte eine stabile Stromversorgung besitzen. In der Govee-App für jede kompatible Lampe **LAN Control** einschalten.
2. **Node.js 22+**, **Chromium**, `curl` und `flock` (util-linux) bereitstellen. Node muss unter dem Pi-Benutzerkonto verfügbar sein. Mit `node --version`, `command -v node` und `command -v chromium` prüfen. Für den Bridge-only-Modus ist **kein `npm install`** nötig.
3. Das **Pi-Bridge-Paket** oder das volle Sonic-Display-Projekt in einen **dauerhaften Ordner** (z. B. `~/sonic-display-pi-bridge`) entpacken, in diesen Ordner wechseln und einmal mit deiner **echten** Vercel-URL ausführen. **Den Ordner später nicht löschen oder verschieben**, da der Dienst absolute Dateipfade verwendet:

   ```bash
   node scripts/pi/install-v910.cjs --url https://DEIN-PROJEKT.vercel.app
   ```

   Die URL wird auf HTTPS und auf gültigen Origin geprüft. Es werden erzeugt:

   - `~/.config/sonic-display/bridge.env` – freigegebener Origin (Mode 600)
   - `~/.config/sonic-display/pi-kiosk.env` – Vercel-URL (Mode 600)
   - `~/.config/systemd/user/sonic-govee-bridge-v910.service` – Bridge-Dienst mit Autorestart
   - `~/.local/bin/sonic-display-kiosk-v910` – Chromium-Kioskstart mit Verbindungs-Wiederholung und persistentem Profil
   - `~/.config/labwc/autostart` – **nur ein eigener markierter Block**, bestehende Einträge bleiben erhalten

   Der Installer benötigt **kein sudo**, aktiviert beziehungsweise startet den Benutzerdienst nach URL-Änderungen neu (wenn eine `systemd --user`-Sitzung vorhanden ist), verändert **keine** Chromium-Sicherheitsflags und löscht **keine** bestehende Konfiguration außerhalb seines eigenen markierten Blocks. Bei einem fehlenden Benutzer-Bus kann stattdessen `--no-start` verwendet und der Dienst nach dem nächsten Login manuell aktiviert werden.
4. In `sudo raspi-config` unter **System Options → Boot / Auto Login** die **Desktop-Autologin**-Option für den Pi-Benutzer aktivieren. Anschließend neu starten. Der Bridge-Dienst wird mit der Benutzer-Session aktiviert und der labwc-Kiosk öffnet automatisch Vercel.
5. Token einmalig anzeigen:

   ```bash
   node scripts/pi/print-govee-token-v910.cjs
   ```

   **Nur im eigenen Terminal anzeigen und nicht öffentlich teilen.** Die Bridge schreibt den Token bei systemd-Start bewusst **nicht** in die Logs. Er liegt privat unter `~/.sonic-display/govee-bridge-token` und bleibt über Neustarts hinweg gültig. **Keinen** Govee-Cloud-API-Key eintragen.
6. Auf dem Raspberry Pi in Sonic Display **Einstellungen → Govee LAN** öffnen: Bridge-Adresse `http://127.0.0.1:8765`, Token eintragen → **Verbindung prüfen** klicken. Aktuelles Chromium fordert ggf. eine einmalige Erlaubnis zum **lokalen/Loopback-Netzwerkzugriff** auf die HTTPS-Vercel-Seite an. Diese Erlaubnis bewusst bestätigen. Die Kiosk-Profildaten bleiben gespeichert.
7. **Leuchten im LAN suchen**, die vier Geräte auswählen, Status lesen und zunächst eine **manuelle Farbe** testen. Musikautomatik erst nach erfolgreichem Test aktivieren (opt-in).

## Betrieb und Fehlerdiagnose

```bash
# Dienststatus ansehen
systemctl --user status sonic-govee-bridge-v910.service
# Neustart nach Änderungen
systemctl --user restart sonic-govee-bridge-v910.service
# Letzte Logs (ohne Bridge-Token)
journalctl --user -u sonic-govee-bridge-v910.service -n 60 --no-pager
# Nach Änderung der URL erneut den Installer aufrufen
node scripts/pi/install-v910.cjs --url https://DEIN-NEUER-ORIGIN.vercel.app
# Verbindung lokal testen (nur mit deinem Token):
TOKEN="$(node scripts/pi/print-govee-token-v910.cjs)"
curl -s -H "Authorization: Bearer $TOKEN" http://127.0.0.1:8765/health
unset TOKEN
```

- **Chromium zeigt keine Webseite:** Internet/DNS, Vercel-Adresse, möglicherweise Zugangsschutz in Vercel, Chromium-Installation und Desktop-Autologin prüfen. Der Launcher versucht bei fehlender Netzverbindung erneut, die Seite zu öffnen; er setzt aber laufende Spotify-/WebGL-Sitzungen **nicht** ungefragt zurück.
- **Bridge offline:** `systemctl --user status`, `journalctl --user`, localhost-Adresse, Node-Pfad und Token prüfen. Der Dienst startet nach Abstürzen selbst wieder. Die Einstellungen zeigen nach dem **ersten manuellen Verbindungstest** alle 12 Sekunden den Bridge-Status; dabei wird bei einem neuen Netzwerkzugriff keine Chromium-Berechtigung umgangen.
- **Origin nicht freigegeben:** HTTPS-Origin der geöffneten Vercel-Seite muss **exakt** mit dem Installer-Argument übereinstimmen (einschließlich Domain und Unterdomain); bei neuer URL Installer erneut ausführen. **Vercel Preview-Domains** haben oft andere Origins als die Produktions-Domain. Bitte nicht pauschal `*.vercel.app` freigeben.
- **Chromium verweigert localhost-Zugriff:** Seitenberechtigungen für die Vercel-Domain öffnen und **Loopback-/lokales Netzwerk** erlauben, danach **Verbindung prüfen** erneut ausführen. Keine Flags wie `--disable-web-security`, `--no-sandbox` oder globales Deaktivieren von Private Network Access nötig.
- **Govee-Suche leer:** Govee-Home-App → LAN Control, gleiche SSID/Subnetz, kein Gastnetz/Client-Isolation, Multicast und UDP 4002 prüfen; bei Multicast-Problemen Govee-IP manuell eingeben und DHCP-Reservierung nutzen.
- **Port 4002 belegt:** Bridge kann UDP-Antworten nicht empfangen. Keine zweite Govee-Bridge oder andere Software auf dem Pi mit demselben Antwortport starten.
- **Einzelne Lampen offline:** Ein Scan läuft bei Bridge-Start und dann alle 120 Sekunden; die Bridge fragt bekannte Geräte alle 35 Sekunden nach Status. Die Anzeige `im LAN erreichbar` basiert auf einer gültigen Antwort in den letzten 90 Sekunden und ist kein Beweis, dass ein Steuerbefehl bereits ausgeführt wurde.

**Sicherheitsmodell:** Token-Pflicht und exakte Origin-Allowlist schützen die lokale Bridge; Govee UDP selbst ist nicht authentifiziert. Nur mit vertrauenswürdigem WLAN verwenden. Die in V909 implementierte Musikautomatik bleibt ohne Zustimmung deaktiviert und erzeugt keine Stroboskop- oder Ein/Aus-Blitzfolgen. Browser und lokales Govee-Funknetz müssen getrennt betrachtet werden.

## Tests / Grenzen

```bash
npm run test:v910
npm run test:v909
npm run test:v909:types
npm run test:v908
npm run test:v907
npm run check:syntax
npm run check:architecture
npm run typecheck        # benötigt alle npm-Abhängigkeiten
npm run build            # benötigt alle npm-Abhängigkeiten
```

V910 prüft u. a. Installer-Idempotenz, URL-/Origin-Sicherheit, Dateimodi, systemd-Unit-Generierung, labwc-Autostart, Chromium-Sicherheitsflags, lokales Bridge-HTTP und Token-Log-Schutz. **Noch nicht geprüft**: realer Raspberry Pi, tatsächlicher labwc-Autologin-Betrieb, Raspberry-Pi-Grafikleistung, Govee-Hardwarekommunikation, vollständiger TypeScript/Next.js-Produktionsbuild ohne Dependencies. Vercel liefert die App aus, aber **WebGL rendert auf der Pi-GPU**.

Die Projektversion in `package.json` bleibt aus Rückwärtskompatibilität für die vorhandenen V908-Regressionsguards vorläufig `0.1.0-v908`; V910 ist der **Integrations-/Funktionsstand**, kein bestandener Hardware- oder Produktions-Release-Gate.
