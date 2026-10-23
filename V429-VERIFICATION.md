# Sonic Display V429 – Prüfnachweis

Stand: 21. Oktober 2026

## Bestätigt in dieser Arbeitsumgebung

- `npm run test:v429` – **PASS**: Rap-Cues mit szenenbasierter Shot-Auswahl, Song-/Zeilen-/Rollenbindung, Stärke- und Motion-Gates, Vorfahrt manueller Kameramodi (Verdrahtungscheck), sicherer Mindestabstand, Lyrics-Schutz, deterministic Hold, Pause, Seek, Trackwechsel und Integration in die vorhandene R3F-Kamera.
- `npm run test:v425`, `npm run test:v426`, `npm run test:v424`, `npm run test:v423` – **PASS**, inklusive der vorhandenen Rap-Ausdrucks- und Inspector-Regressionen. V423/V426-Tests akzeptieren nun Folgeversionen ab ihrem Mindeststand, statt V425/V426 fest vorauszusetzen.
- `tsc -p tests/tsconfig.v429-core.json`, `tsc -p tests/tsconfig.v426-core.json`, `tsc -p tests/tsconfig.v425-core.json` – **PASS** mit strenger Prüfung der isoliert ausführbaren Kernlogik.
- `npm run check:syntax` – **PASS** für 579 TS/TSX-Dateien.
- `npm run test:imports` – **PASS** für 917 geprüfte Projektdateien und 1962 Importe.
- `npm run test:module-case` – **PASS**; keine widersprüchlichen Modulnamenschreibweisen.

## Offen oder blockiert

- `node scripts/build-preflight.cjs` – **BLOCKIERT**: `package-lock.json` fehlt im Ausgangsarchiv; 16 von 17 npm-Abhängigkeiten (u. a. `next`, `react`, `three`, `@react-three/fiber`) fehlen im Container. Das vorherige npm-Registry-DNS-Problem (`EAI_AGAIN`) verhinderte die Neuinstallation.
- Der vollständige `npm run build:preflight`-Durchlauf wurde nicht zu Ende bestätigt; die erste Gruppe bestand, weitere npm-Tests wurden aufgrund fehlender lokal verfügbarer Abhängigkeiten nicht als erfolgreich gezählt.
- `npx tsc --noEmit` und `npm run build` – **NICHT vollständig bestätigt**; die hierfür erforderlichen Abhängigkeiten stehen nicht zur Verfügung.
- Keine Playwright-, Browser-, GPU- oder GLB-Renderprüfung. Die sichere Kamerapose wird mathematisch und per Source-Integration geprüft, aber visuelle Kamerawirkung muss im Browser getestet werden.

## Lokale Abschlussprüfung (Windows / Node >=20.9)

```powershell
npm install
npm run test:v429
npm run test:v426
npx tsc -p tests/tsconfig.v429-core.json
npx tsc --noEmit
npm run build
```

Falls `npm install` zunächst scheitert, bitte Netzwerk-/Registry-Zugang prüfen. Ohne Build-Erfolg ist V429 kein produktionsverifiziertes Release.

## Versionssprung

V429 setzt den im V426-Übergabebericht bereits angekündigten Kamera-Meilenstein um. V427 und V428 sind hier **keine eigenständig abgeschlossenen Produktversionen**; es wird nicht behauptet, sie enthielten neue Funktionen.
