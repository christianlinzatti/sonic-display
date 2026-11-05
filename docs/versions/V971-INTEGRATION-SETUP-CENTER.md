# V971 – Concert Integration Setup Center (Alexa & Govee)

## Neue Funktionen

- **V971 Einrichtungsassistent:** Im **Einstellungen → Govee LAN**-Bereich zeigt er sechs getrennte lokale Schritte und den ausdrücklich **unbestätigten Cloud-Status**. Fortschritt ist nur eine lokale Checkliste, kein End-to-End-Beweis. Die Buttons **Bridge-Verbindung prüfen** und **Geräte suchen** verwenden die vorhandene, sichere V909-API. Keine geheimen Token werden angezeigt oder übertragen, außer bei der vorhandenen autorisierten Bridge-Anfrage.
- **Windows-Govee-LAN-Bridge:** Das ZIP `SonicDisplay-Govee-LAN-Bridge-V971.zip` enthält den bestehenden V909/V910-Bridge-Code, das offizielle UDP-Protokoll-Modul, Startdateien für lokalen Betrieb und eine exakte HTTPS-Origin auf Vercel, ein ausdrücklich aufzurufendes Token-Anzeige-Skript sowie eine **rein lesende** Zustandsdiagnose. Der Bridge-Prozess bleibt in einer sichtbaren Windows-Konsole; keine Autostart-/Firewall-Änderung.
- **Raspberry-Pi-Govee-LAN-Bridge:** Das zusätzliche ZIP `SonicDisplay-Govee-LAN-Bridge-RaspberryPi-V971.zip` enthält ARM64-/Linux-Startdateien, manuelle Vercel-Origin-Freigabe und ausschließlich read-only-Diagnose. Bereits installierte V910-Pi-Kiosks verwenden **denselben Bridge-Code** und dürfen nicht gleichzeitig eine zweite Instanz am Port 8765 starten. Keine sudo-Aufrufe, kein Systemdienst-Autostart im Standalone-Paket.
- **Alexa:** Weiterhin im Gesamtpaket unter `integrations/alexa/handler.cjs` + `interaction-model.de-DE.json`. Kein Skill wird automatisch bei Amazon angelegt. Die vorhandene signierte Relay-Anbindung bleibt unverändert; die Windows-Bridge erhält keine zusätzlichen Alexa-Schaltbefehle.

## Installation

1. Vollständiges `SonicDisplay-V971.zip` in `releases/` hochladen; der generische Importer benötigt `package.json.sonicRoadmapRelease=v971`.
2. Für Windows das separate Bridge-ZIP herunterladen und entpacken. Node 24 installieren (keine npm-Installation für die Bridge nötig). `start-govee-bridge.cmd` starten oder für die veröffentlichte Webseite `start-for-vercel.cmd`. Das zweite Skript verlangt die **exakte Vercel-HTTPS-Origin**; es erlaubt keine Wildcard-Origin.
3. `show-token.cmd` **bewusst** öffnen. Token ausschließlich in Sonic Display unter **Einstellungen → Govee LAN → Bridge-Token** eintragen. `check-bridge.cmd` auf dem gleichen PC als sichere Diagnose ausführen.
4. In Sonic Display **Bridge-Verbindung prüfen**, danach **Geräte suchen**, ausgewählte Geräte einschalten und ggf. Govee-Musiksynchronisation ausdrücklich freigeben. Lampen müssen Govee LAN Control unterstützen und im selben Netzwerk sein.
4b. **Raspberry Pi:** Unter Raspberry Pi OS 64-bit mit Node.js 24 im Pi-Bridge-ZIP `bash start-govee-bridge.sh` (lokaler Browser) oder `bash start-for-vercel.sh https://deine-app.vercel.app` ausführen. Mit `bash check-bridge.sh` den Status lesen und das Token nur auf ausdrücklichen Wunsch mit `bash show-token.sh` anzeigen. Wenn der V910-Kiosk-Dienst bereits läuft, diesen verwenden statt einer zweiten Bridge. Chromium muss lokal auf dem Pi laufen; niemals Port 8765 ans Internet binden.
5. In der Amazon [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) den privaten Skill anlegen/aktualisieren, das im Projekt enthaltene deutsche Interaktionsmodell verwenden und Lambda (`integrations/alexa/handler.cjs`) mit der **Alexa Skills Kit Trigger Skill-ID-Prüfung** verbinden. Nur in AWS/Vercel (nie GitHub) die `ALEXA_SKILL_ID`, `ALEXA_ALLOWED_USER_ID`, `ALEXA_BRIDGE_SECRET`, `SONIC_DISPLAY_ORIGIN`, `UPSTASH_REDIS_REST_URL` und `UPSTASH_REDIS_REST_TOKEN` setzen.
6. Im **Ultimate Concert Experience Studio** die lokale Alexa-Empfangsfreigabe und ggf. separate Alexa-Govee-Erlaubnis aktivieren. Nur bei bereits laufendem Govee Musik-Sync und ohne manuelle Overrides sind sanfte Alexa-Raumlooks möglich. Vor realem Hardwaretest **nicht** als vollständig eingerichtet betrachten.

## Sicherheitsgarantien

- Keine Änderung der bisherigen Bridge-Authentifizierung: Bearer Token, Origin-Whitelist, localhost-HTTP-Bindung, private Govee-IPs, UDP-Sendebegrenzungen.
- Neues Raspberry-Pi-Paket verwendet die gleiche Node-Bridge, bleibt standardmäßig im Vordergrund und ändert keine Dienste/Firewall.
- Neues Windows-Paket verwendet nur Node.js-Bordmittel und ruft nie ohne ausdrücklichen Bedienerbefehl das Token-Abfrageskript auf.
- Die Diagnosen verwenden `GET /health` und lösen keine Govee-Power-/Color-Commands aus.
- Alexa-Empfang und separate Govee-Zustimmung bleiben standardmäßig deaktiviert. Browser-Status kann die AWS-/Upstash-Verbindung nicht zuverlässig bestätigen und zeigt sie daher stets als ungeprüft.
- Keine Sprachsteuerung von Spotify oder direkter Lampenstromversorgung.

## Tests

```bash
npm run test:v971
npm run test:v971:types
npm run test:v970
npm run test:v970:lambda
npm run typecheck
npm run build
```

Die vollständigen Node-24-CI-Builds und Tests mit realen Echo/Govee-Geräten müssen unabhängig von lokalen Regressionen erfolgreich verlaufen.
