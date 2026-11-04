# V414 – Verification

## Durchgeführt (Offline-Umgebung)

- `npm run test:v414`: bestanden. Anker für echte Lyrics-Zeilen und -Wörter, Speicherung/Entfernung pro Spotify-Track und Avatar, harte Validierung, manuelle Gesten und Begrenzungen, Pausen/Reduced Motion, Überblendung nur eigener Motion-IDs, UI- und Live-Einbindung.
- `npm run test:v413`, `npm run test:v412`, und alle Tests V403–V414 einzeln: bestanden.
- Historische vollständige Offline-Kette bis V402: **146 einzelne Prüfungen** bestanden, danach Zeitlimit der Umgebung (kein Testfehler). Die verbleibenden V403–V414-Prüfungen wurden danach einzeln ausgeführt.
- `npm run check:syntax`: bestanden, 557 TS-/TSX-Quelldateien.
- `npm run test:imports`: bestanden, 880 Projektdateien / 1.855 Imports.
- `npm run test:module-case`: bestanden.
- `tsc -p tests/tsconfig.v414-core.json`: bestanden, isolierte TypeScript-Strict-Prüfung der V414-Kernlogik.

## Ausstehend auf Windows

Das Offline-Arbeitsverzeichnis hat **keine lokalen npm-Abhängigkeiten** und kein mitgeliefertes `node_modules`. Der volle `npx tsc --noEmit` und `npm run build` (Next.js 15.5.x) konnten daher **nicht** in dieser Umgebung bestätigt werden. Die beiden neuen React-/Three.js-Einbindungen benötigen einen echten, vollständig installierten Next.js-Produktions-Build als Abschlussprüfung.

Empfohlene Befehle:

```powershell
npm install
npx tsc --noEmit
npm run build
```

Danach mit realem Spotify-Track und synchronisierten Lyrics den neuen Editor testen. Für die Live-Wirkung ein V412-Preset für denselben GLB-Avatar aktivieren und die V414-Live-Option einschalten. Manuelle Choreografien sollen ihre bisherige Priorität behalten. Die frühere npm-audit-Warnung ist unabhängig und muss separat geprüft werden.
