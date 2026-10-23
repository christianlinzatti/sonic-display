# V166 – Touchscreen & Kiosk Experience

Basiert auf V165. Der optionale **Touchmodus** fügt eine große Touchleiste für 10-Zoll-Displays hinzu. Drei Ansichten: **Avatar** (Szene und kompakte Titelinfos), **Mix** (Szene, Titelinfos und Lyrics), **Lyrics** (Lyrics im Vordergrund). Der Modus ist zunächst deaktiviert und wird im Browser gespeichert. Die Leiste blendet sich nach fünf Sekunden aus, ein Tipp am oberen Rand zeigt sie wieder. Native Browser-Vollbildsteuerung erfordert einen Nutzerklick. Chromium `--kiosk` muss weiterhin durch die Linux-Startumgebung eingerichtet werden.

V166 ändert weder Spotify-Wiedergabefunktionen noch gespeicherte GLB-Animationen oder die bestehenden Performanceprofile. Ältere Einstellungen bleiben vorhanden. CSS richtet sich an 1024×600 (Landscape) und 1920×1200; Hochformat erhält ein separates Layout. Keine automatische System-Kiosk-Aktivierung.

## Prüfung
`npm run test:touch-kiosk`, `npm run verify:offline`, `npm run typecheck`, `npm run build`. Ohne node_modules sind TypeScript-Check und vollständiger Next.js-Build nicht ausführbar.
