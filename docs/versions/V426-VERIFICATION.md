# Sonic Display V426 – Prüfnachweis

Stand: 21. Oktober 2026

## Bestanden (in dieser Erstellungsumgebung)

- `npm run test:v426` **PASS**: gemeinsame Zeitachsen, Herkunft der Spuren, Track-/Avatar-Isolation, Worttiming, Limits, Vorschlagsarten, V420-Manuell-Vorrang, lokale A/B-Vorschau und Integrationsverdrahtung.
- `npm run test:v425` **PASS**, `npm run test:v424` **PASS**.
- Die direkten fachlichen Regressionen V405–V424 (V412-Haupttest separat von dessen eigenem Nullguard-Test) liefen erfolgreich durch. Der zusätzliche V412-Nullguard-Test wurde separat ebenfalls erfolgreich ausgeführt.
- `tsc -p tests/tsconfig.v426-core.json` **PASS**: strenge Typprüfung des V426-Kerns sowie der transitiven Rap-Abhängigkeiten. `tsc -p tests/tsconfig.v425-core.json` **PASS**.
- `npm run check:syntax` **PASS**: 578 TS/TSX-Dateien.
- `npm run test:imports` **PASS**: 915 Projektdateien / 1.958 Importe.
- `npm run test:module-case` **PASS**: keine case-insensitiven Modulnamenkonflikte.
- Versionierte historische Regressionen mit hart kodierten V425-Listen wurden auf V426 erweitert, ohne fachliche Funktionsprüfungen zu entfernen.

## Nicht vollständig verifiziert

- `npm install`: **BLOCKIERT**. npm-Registry aus der Erstellungsumgebung wegen DNS-Fehler `EAI_AGAIN` nicht erreichbar. Ausgangsarchiv hat keine `package-lock.json` und keine installierten Abhängigkeiten.
- `node scripts/build-preflight.cjs`: **BLOCKIERT** (1/17 Abhängigkeiten verfügbar). Es wurde keine nicht existierende Lockdatei erzeugt.
- `tsc --noEmit`: **FEHLER mangels npm-Abhängigkeiten und Typdefinitionen** (u. a. `next/server`, `react`, `@types/node`); keine erfolgreiche projektweite TypeScript-Prüfung behauptet.
- `npm run build` / produktiver Next.js-Build: **NICHT ERFOLGREICH BESTÄTIGT**, da der projektweite Preflight vor Kompilierung von den fehlenden Paketen blockiert wird.
- Echte GLB-/Browser-Renderausgabe und Musik-/Audio-Synchronisierung: in dieser Umgebung nicht durch einen Browser-/GPU-Test verifiziert.

## Lokale Abschlussprüfung unter Windows

```powershell
npm install
npm run test:v426
npx tsc --noEmit
npm run build
```

Die Automatik für V425-Kameraimpulse bleibt weiterhin diagnostisch und wurde hier nicht als Live-Kameraregisseur implementiert. Kamera-Keyframes und manuelle V385-Besetzungen bleiben unberührt.
