# V456 – Verifikation

## In dieser Umgebung erfolgreich geprüft

- `npm run verify:v456` mit Exit-Code **0**.
- Isolierte TypeScript-Kernprüfung für V456 (`tsc -p tests/tsconfig.v456-core.json --noEmit`), alle neuen Funktionsprüfungen bestanden.
- Direkte Regressionstests V445–V455, einschließlich der Kernprüfungen V446–V455, bestanden.
- Zusätzliche, für den Show Director relevante Tests V442 (3–4 Avatare), V429 (manuelle Kamera und Lyrics-Schutz), V423 (Rap-Audio-Analyse), bestanden.
- `npm run check:syntax`: **623 TS-/TSX-Dateien** geprüft.
- `npm run test:imports`: **990 Projektdateien / 2.184 Imports** geprüft.
- `npm run test:module-case`: **990 Quelldateien** auf Groß-/Kleinschreibung von Modulimporten geprüft.
- V456 testet den Vorrang synchronisierter Lyrics, die Verschiebung automatischer Genius-Karten bei Gruppen-Hooks, Solo-/Crew-/Interlude-Regie, Beleuchtungsgrenzen, Motion-Slots, Pause, reduzierte Bewegung sowie manuelle Vocal-/Kameraregie.
- Das ZIP wurde gegen alle Dateien der V455-Archivbasis auf Vollständigkeit geprüft und mit `zipfile.testzip()` auf CRC-Fehler getestet.

## Einschränkungen

- **Noch kein kompletter Next.js-/TypeScript-App-Build:** Hier sind die projektlokalen npm-Abhängigkeiten nicht installiert. Die isolierten TypeScript-Kernprüfungen ersetzen den vollständigen `npm run typecheck` nicht.
- **Kein echter Spotify-/Genius-/GLB-/WebGL-Browsertest** in dieser Umgebung. Erscheinungsbild, Animations-Framerate und Kameraausschnitte müssen auf einem echten Gerät geprüft werden.
- Der erste, historische rekursive Prüfaufruf überschritt ein Laufzeitlimit, ohne bis dahin einen Fehltest zu melden. Deshalb wurde `verify:v456` auf eine **endliche, nicht redundante Prüfstrecke** mit relevanten Vorversionen und allen Strukturprüfungen reduziert; dieser aktualisierte Aufruf lief erfolgreich durch. Die gesamte historische Suite wurde nicht vollständig bis zum Ende ausgeführt.
- V456 erkennt keine echten Rapper-Stimmen, Phoneme oder verlässliche Strophen-/Hook-Grenzen ohne geeignete Songdaten. Die automatische Regie verwendet vorhandene, konservative V446-Heuristiken.

## Für Windows / Raspberry Pi

```powershell
npm install
npm run verify:v456
npm run typecheck
npm run build
npm run dev -- --hostname 127.0.0.1
```

Zu prüfen: echte 2–4-Avatar-Features, manuell gesetzte Vocal-Rollen/GLB-Motions/Kamera-Keyframes, Rap-Hook-Kamerawinkel, synchronisierte Lyrics und Genius-Anzeigepausen, Reduced Motion, 10-Zoll-/Raspberry-Pi-Performance.
