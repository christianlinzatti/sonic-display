# Sonic Display V971 – Govee-LAN-Bridge für Windows

**Keine Installation mit npm erforderlich.** Node.js 24, Windows 10/11 und freigeschaltetes Govee LAN Control im selben lokalen Netzwerk werden benötigt. Die Bridge benötigt **keine** Govee Cloud-ID. Der lokale HTTP-Dienst bindet ausschließlich an `127.0.0.1:8765`; die UDP-Gerätesuche läuft nur im LAN. Hardwarekompatibilität ist modellabhängig.

1. ZIP in einen eigenen Ordner entpacken (nicht direkt aus ZIP starten).
2. `start-govee-bridge.cmd` doppelklicken, wenn Sonic Display auf **demselben PC** unter `http://localhost:3000` geöffnet ist.
3. **Bei einer Vercel-Webseite:** stattdessen `start-for-vercel.cmd` verwenden und die **exakte öffentliche HTTPS-Origin** eingeben, z. B. `https://meine-app.vercel.app` (ohne Slash am Ende). Die Bridge nicht über das Internet freigeben.
4. Separat `show-token.cmd` ausführen und den angezeigten Wert im Sonic Display unter **Einstellungen → Govee LAN → Bridge-Token** eingeben. Das Token niemals in GitHub, Chat, Screenshots oder AWS speichern. Token liegt unter `%USERPROFILE%\.sonic-display\govee-bridge-token`.
5. `check-bridge.cmd` führt eine **read-only** Gesundheitsprüfung aus; keine Lampen werden geschaltet.
6. Im Browser auf **Verbindung prüfen** und **Leuchten im LAN suchen** klicken. Bei Browseranfragen zum lokalen Netzwerk die Freigabe bewusst erteilen. Geräte auswählen; Musik-Sync optional getrennt aktivieren.
7. **Alexa:** Der private Alexa-Skill benötigt weiterhin AWS Lambda, Vercel, Upstash und eigene Umgebungsvariablen. Er ist als Quellcode im Gesamtprojekt unter `integrations/alexa/` enthalten, **nicht automatisch im Amazon-Konto installiert**. Die Govee-Freigabe im Konzertstudio bleibt standardmäßig aus.

## Fehlerdiagnose

- `node` fehlt: Node.js 24 installieren, Terminal danach erneut öffnen.
- Fehler `EADDRINUSE`: Bridge läuft bereits oder Port 8765 ist belegt; nicht mehrfach starten.
- Keine Geräte: Telefon-/Geräte-App → **LAN Control** aktivieren; Geräte und PC im gleichen WLAN/LAN, keine Gastnetz-Isolation; UDP 4001/4002/4003 in lokaler Firewall prüfen.
- Fehler `Origin nicht freigegeben`: Bridge mit `start-for-vercel.cmd` und **exakter** HTTPS-Origin erneut starten.
- Browser meldet eine lokale Netzwerkberechtigung: im Browser erteilen; keine unsicheren Browser-Flags nötig.
- `401`: Token mit `show-token.cmd` neu übernehmen (nicht öffentlich machen).

Die Fenster von `start-govee-bridge.cmd` müssen geöffnet bleiben. Ein Autostart oder Windows-Dienst wird **nicht** ohne ausdrückliche Benutzerentscheidung eingerichtet. Beim Schließen stoppt die Bridge. Die Bridge sendet bei Start nur Govee-Suche/Status, niemals Power/Farbe ohne bewussten Anwenderbefehl oder separat aktivierte Musiksynchronisation.
