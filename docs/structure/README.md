# Sonic Display – Projektstruktur nach der V966-Bereinigung

Diese **reine Strukturmigration** basiert auf dem vollständigen V965-Archiv. Sie enthält **noch keine** Alexa-Anbindung oder neue Renderfunktionen.

Der Paketstand `0.1.0-v908` und das Metadatum `sonicRoadmapRelease: v965` bleiben vorerst aus Kompatibilitätsgründen erhalten. Einige ältere Tests erwarten V908; der bereits installierte GitHub-Importer verarbeitet ausschließlich `releases/SonicDisplay-V965.zip`.

## Ordnerübersicht

- `app/` – Next.js und API-Routen
- `components/` – React-UI und Konzertvisualisierung
- `lib/`, `services/`, `config/`, `context/`, `hooks/`, `types/` – Anwendungslogik
- `public/`, `data/` – Assets und optionale lokale Daten
- `tests/` – produktive Tests samt TypeScript-Testkonfiguration
- `scripts/` – aktive Validierungs- und Importwerkzeuge
- `docs/versions/` – historische Versionsdokumentation
- `docs/features/` – Anleitungen nach Themen: Avatare, Tanz, Lyrics, Bühne, Audio, Performance, Integrationen, Anwendung
- `docs/setup/` – Installation, etwa Spotify OAuth
- `docs/history/retired-installers/` – stillgelegte historische Installer als `.txt` (nicht ausführbar)
- `artifacts/historical/` – historische Manifeste, Reports und Testprotokolle; keine aktuelle Testzertifizierung
- `artifacts/legacy-snapshots/` – drei archivierte historische Dateien, die in alten Stagingkopien vom aktiven Code abweichen
- `README.md`, `ARCHITECTURE.md`, Paket-, TypeScript-, Next.js- und Vercel-Dateien – die wenigen bewusst verbliebenen Root-Dateien

## Umgang mit v874–v878

Die 17 Dateien aus `v874/` bis `v878/` sind bereits unter ihren echten Pfaden in `components/visualizer/` und `tests/` vorhanden. Deshalb wurden die fünf Root-Stagingordner entfernt. Drei abweichende ältere Dateien wurden unter `artifacts/legacy-snapshots/` unveränderbar als Text gesichert, statt aktuelle Komponenten zu überschreiben. Die fünf Legacy-Installer wurden ebenfalls als nicht ausführbare Texte archiviert.

Frühere SHA256-Manifeste werden nicht umgeschrieben, damit historische Prüfnachweise unverfälscht bleiben. Ihre alten Dateipfade können daher auf bereits entfernte Stagingkopien zeigen.

## Automatischer GitHub-Import

Der vorhandene Workflow `.github/workflows/v965-project-archive-import.yml` hört weiterhin auf **`releases/SonicDisplay-V965.zip`**. Während des Imports ruft er `node scripts/organize-version-docs.cjs` auf, das nun auch `scripts/organize-project-structure.cjs` ausführt. So werden alte Root-Dateien und `v874/` bis `v878/` im GitHub-Checkout tatsächlich entfernt und im Importcommit als Löschungen erfasst. Die Migration ist idempotent und beendet sich bei unerwarteten Dateikonflikten.

## Prüfung

```sh
npm run structure:organize
npm run test:structure
npm run check:architecture
npm run test:v874 && npm run test:v875 && npm run test:v876 && npm run test:v877 && npm run test:v878
npm run typecheck
npm run build
```

Künftige Versionsnotizen gehören nach `docs/versions/`, thematische Funktionstexte nach `docs/features/`, Tests nach `tests/` und neue Implementierungen in die bestehenden fachlichen Source-Ordner – niemals in einen neuen `v###/`-Rootordner.
