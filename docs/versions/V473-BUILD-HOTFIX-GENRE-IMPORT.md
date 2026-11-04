# V473 – Build-Hotfix: Genre-Import (V473.1)

## Ursache

Der isolierte TypeScript-Compiler in `tests/tsconfig.v465-core.json` (und vererbten älteren Testkonfigurationen) wird nicht von der Next.js-`tsconfig.json` abgeleitet und hat daher keine `@/*`-Alias-Konfiguration. Im transitiv eingebundenen Modul `components/visualizer/genreSpecificDanceIntelligence.ts` wurde seit der erweiterten Genre-Unterstützung `MusicGenre` per `@/config/musicGenres` importiert. Dadurch brach `npm run build` schon im `prebuild` bei `test:v465` mit `TS2307` ab.

## Korrektur

Einzige Quellcodeänderung: `import type {MusicGenre} from "../../config/musicGenres";` statt `"@/config/musicGenres"`. Der Typ und die 34 Genre-Profile, Genre-Fusion, die Rap-Choreografie und das übrige Laufzeitverhalten bleiben unverändert.

Der Versionsbezeichner in `package.json` bleibt absichtlich `0.1.0-v473`, sodass ältere Versionsregressionen kompatibel bleiben. Das Paket ist die korrigierte V473, in diesem Dokument als Hotfix V473.1 bezeichnet.

## Prüfung

- `tsc -p tests/tsconfig.v465-core.json --noEmit`: PASS
- `tsc -p tests/tsconfig.v466-core.json --noEmit`: PASS
- Alle übrigen Schritte der bestehenden `build:preflight`-Testkette (bis `test:camera-hold`): PASS
- `scripts/build-preflight.cjs`: in der Prüfungsumgebung durch fehlende npm-Abhängigkeiten blockiert (1/17 verfügbar). Kein Anwendungsfehler.
- Next.js-Produktions-Build und `npm run typecheck` müssen mit installierten Abhängigkeiten vor Ort getestet werden.

Auf Windows aus dem Projektverzeichnis:

```powershell
npm run test:v465
npm run build
```

Alternativ nur die Quellcodekorrektur aus `sonic-display-v473-genre-import-hotfix.patch` übernehmen (`git apply` im Projektverzeichnis) oder die oben genannte Importzeile ändern.
