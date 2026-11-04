# Sonic Display V165 – Raspberry Pi Performance Edition

V164 vollständig übernommen. V165 ergänzt eine optionale, browserbasierte Pi/Linux-ARM-Erkennung, auswählbare Low/Balanced-Geräteprofile und Vollbildbedienung. Keine Hardwarekennung ohne explizite Browserhinweise; Linux ARM ist nicht zwingend ein Raspberry Pi. Auto-Profil ist standardmäßig **aus**. Es wird bei eindeutigen bzw. ARM-Hinweisen nur die Renderqualität gesetzt, kein DRM, Audio oder IK geändert.

## Raspberry Pi Setup

Empfohlen: aktuelles Raspberry Pi OS (64-bit), unterstütztes Node.js >=20.9, Chromium mit aktivierter Hardwarebeschleunigung. Prüfe Node/npm und installiere Projekt-Abhängigkeiten:

```bash
npm ci  # sofern eine Lockdatei vorhanden ist; sonst npm install
npm run typecheck
npm run build
npm run start -- --hostname 0.0.0.0
```

Chromium-Kiosk beispielsweise (nach Anpassen der lokalen URL und Displayumgebung):

```bash
chromium-browser --kiosk --no-first-run --disable-session-crashed-bubble http://localhost:3000
```

Kein automatischer Startdienst installiert; Autostart mit systemd oder Desktop-Autostart muss vor Ort eingerichtet werden. Kiosk-Modus kann ohne Benutzerinteraktion nur durch die Browser-Startoption aktiviert werden, nicht durch die Web-Fullscreen-API.

## Hinweise

- Unter `Dance engine diagnostics` das Pi-Profil wählen; persistiert lokal im Browser.
- Bei Appstart wird es in der 3D-Komponente vor Beginn der Darstellung angewandt; alte Qualitätseinstellungen bleiben sonst erhalten.
- Performance-Profiler V163 und Scheduler V164 bleiben erhalten, um CPU-Bottlenecks zu messen.
- GPU- und GLB-Tests auf einem physischen Pi und vollständiger Next.js-Build müssen separat verifiziert werden.
