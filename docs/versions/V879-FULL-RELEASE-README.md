# Sonic Display V879 – Intelligent Crowd Camera & Stage Harmony

**Vollständige Projektdatei**, kein Patch. Dieser Release enthält das gesamte Sonic-Display-Projekt auf Basis der vollständigen V873-Datei, mit integriertem Quellcode der Versionen V874–V879. Die Installation der Einzel-Upgrades ist **nicht** nötig.

## Start unter Windows (PowerShell)

1. ZIP in einen **neuen** Ordner entpacken; nicht die bestehende Installation ohne Backup überschreiben.
2. Node.js 22 oder neuer und Internetzugang für `npm ci` bereitstellen.
3. PowerShell im Ordner mit `package.json` öffnen.

```powershell
npm ci
npm run verify:v879:focused
npm run typecheck
npm run build
npm run dev
```

`npm run dev` ist für die lokale Vorschau gedacht. Für den Produktivbetrieb nach erfolgreichem Build `npm run start` verwenden. Erforderliche Spotify-Schlüssel und andere Konfigurationsdaten gegebenenfalls anhand von `.env.example` über eine eigene `.env.local` eintragen. **Keine Zugangsdaten im ZIP.**

Die Upgrades `apply-v874.cjs` bis `apply-v878.cjs` befinden sich ausschließlich zur Nachvollziehbarkeit und für bestehende Regressionstests im Projekt. **Nicht** erneut ausführen: V874–V879 sind bereits im vollständigen Quellcode integriert.

## V879-Funktionen

- Kameraabhängige Zurücknahme bestehender Zuschauerbewegungen bei Nahaufnahmen von Sängerinnen, Sängern und Rappern.
- Sichtbare Lyrics erhalten Vorrang vor Armbewegungen, Telefonlichtern und LED-Armbändern.
- Bei verifizierten Kameratotalen bleibt mehr Festivalatmosphäre erhalten.
- Die bereits vorhandenen V791-Übergänge können publikumsseitig sanfter gestaltet werden.
- Manuelle Kameraauswahl wird nicht überschrieben. Eine zusätzlich aktivierte Lyrics-Sichtschutzoption gilt auch bei manueller Kamera.
- Einstellungen im Concert FX Studio: Hauptschalter, Lyrics-Schutz, Performer-Priorität, Übergangsglättung, Intensität 0–100 %, Stil (Cinematisch / Ausgewogen / Festival).
- Nur Verkleinerung vorher freigegebener Effekte: keine zusätzlichen 3D-Personen, Kameras, Meshes, Draw Calls, Point Lights, Timer, Stroboskope oder neuen Audio-/Tracking-Zugriffe. Weiterhin maximal 72 virtuelle Zuschauer.
- Kein pixelgenauer Screen-Space-Okklusionstest und keine echte KI-Gestenerkennung; die Regie benutzt vorhandene verifizierte Kamerahinweise.

## Prüfstatus (3. November 2026)

**Erfolgreich:**
- Isolierte TypeScript-Checks für V810, V815, V825, V868, V873 und V874–V879 (jeweils `npm run test:vN:types`).
- 28/28 neue V879-Regressionstests.
- Gezielte V810, V815, V825, V868, V873 und V874–V878-Tests, insgesamt 11 ausgewählte erfolgreiche Testläufe inklusive V879.
- Syntax-/Importprüfung von 1282 TS/TSX-Quelldateien.
- Windows-/Linux-Groß-/Kleinschreibungsprüfung über 2189 Quelldateien, keine Kollisionen.
- Integrationsfolge V873-Basis → V874 → V875 → V876 → V877 → V878 → V879 in einer vollständigen Projektkopie.

**Nicht erfolgreich / nicht abgeschlossen:**
- `npm ci --offline` war nicht möglich: ein npm-Paket (zustand) lag nicht im Cache (`ENOTCACHED`).
- Online-Abfrage der npm Registry ist in dieser Laufzeitumgebung durch DNS-Fehler `EAI_AGAIN` gescheitert.
- `npm run typecheck` (gesamtes Projekt) ist wegen fehlender installierter Abhängigkeiten (unter anderem Next.js, React und Node-Typen) fehlgeschlagen.
- `npm --ignore-scripts run build` scheiterte mit `next: not found`, da `node_modules` nicht verfügbar sind. Ein vollständiger Next.js-Produktionsbuild und Browsertest sind hier **nicht** nachgewiesen.

**Freigabestatus: Vollständige Release-Datei mit erfolgreich getesteter Integrationslogik, aber noch keine produktionsvalidierte Version.** Bitte auf Windows oder in GitHub Actions mit `npm ci`, `npm run typecheck` und `npm run build` verifizieren.

## Umfang

- Komplettes Projekt einschließlich `app/`, `components/`, `services/`, `public/`, `tests/`, `package.json` und `package-lock.json`.
- Keine `node_modules` / `.next` / Build-Artefakte / lokalen Geheimnisse.
- `package.json` und `package-lock.json` konsistent auf Version `0.1.0-v879` gesetzt.
