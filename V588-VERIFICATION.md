# V588 – Verifikation (26.10.2026)

## Erfolgreich geprüft

| Prüfung | Status | Umfang |
| --- | --- | --- |
| `npm run test:v588` | PASS | 16 Gruppen, 20.000 Wiedergabepunkte; große Bibliothek >100 geladene Actions, musikalische Rotation, Seek, Pausen/Manual/Reduce, Genre-/Section-Priorität, Wechsel-Sperre, keine neuen Mixer oder Clips |
| `npm run test:v588:types` | PASS | V588-Planer, V536-Integration-Hook, frühere pure Motion-Typen; isolierte React-Typstubs nur für den lokalen Typcheck |
| `npm run test:smoke:v588` | PASS | V588–V580, V572, V536, Architektur, Syntax-/Imports |
| `npm run check:syntax` | PASS | 807 TS/TSX-Dateien (Parser und Importbindungen, **kein** vollständiger Next.js-Typecheck) |
| `npm run check:architecture` | PASS | 383 aktuelle Quelldatei-Referenzen, Stand V588 |
| Einzeltests V530, V531, V533, V535, V536, V545 | PASS | Library-Metadaten, bestehende Motion-Importpolitik, Genre, Director, additive Bewegungsabstimmung. Bei V531 und V545 waren **keine echten lokalen GLB-Dateien** vorhanden. |
| Einzeltests V565 und V500 | PASS | 45 Motion-Crossfade-/Footwork-Tests und Duett-Sicherheit einschließlich vorgegebener Rollen |

Die Gesamtsequenz `npm run verify:v588` erreichte das Ausführungslimit beim Start von V565. V565 und V500 wurden deshalb **separat erfolgreich** ausgeführt. Die Gesamtsequenz wird nicht als durchgelaufen ausgewiesen.

## Neue Sicherheitsgrenzen

- Die V588-Rotation wählt ausschließlich verfügbare, bereits gebundene Action-Namen und kopiert weder Clip-Keyframes noch GLB-Bones.
- Es gibt **kein neues 20-/64-Clip-Limit in V588**; bisherige Importgrenzen anderer Module werden nicht geändert. Keine automatischen neuen Dateien oder Installationen.
- Die bisherige V536-Eignung priorisiert Genre, Energie und Section; mehrere ungefähr gleich gute Kandidaten sind Voraussetzung für neue Rotation. Lauf-/Root-Bewegungen sind in der neuen Rotation ausgeschlossen, wenn sichere Alternativen existieren.
- Ausdrücklich manuelle Motion-/Song-Timelines, Loops, Gruppenchoreografie, aktive Rap-Presets und `reducedMotion` behalten Vorrang; kein eigener Frame-Loop. Bestands-Crossfade V492 bleibt erhalten.
- Deterministische Auswahl über Song/GLB/Section/BPM/Avatar-Slot; sichere 8-s-Umschaltabstände, auch bei häufigen Abschnittswechseln.

## Noch ausstehend

- **Vollständiger Next.js-Typecheck und `npm run build`** mit allen installierten Abhängigkeiten: das Ausgangsarchiv enthält keine `node_modules` und keinen vollständigen reproduzierbaren npm-Lockfile-Test.
- **Visuelle Abnahme in Chromium** mit tatsächlich geladenen GLBs, Laufbewegungs-/Fußkontaktprüfung, Song-seek, Multi-Avatar-Performance und realer Lyrics-/Audio-Synchronisation.
- **Raspberry-Pi-Hardwaremessung** auf dem 10-Zoll-Display; es wurden weder FPS gemessen noch WebGL-GPU-/Thermaldaten nachgewiesen.

## Lokale Prüfung

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v588
npm run verify:v588
npm run typecheck
npm run build
```

Die Installation sollte für eine reproduzierbare Freigabe einen tatsächlich erzeugten und geprüften `package-lock.json` behalten. Für echte Pi-Metriken `npm run benchmark:v580:pi` auf dem Zielgerät ausführen; ein Offline-Test beweist keine visuelle Qualität.
