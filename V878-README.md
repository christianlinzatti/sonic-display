# Sonic Display V878 – Smart Audience Emotion & Energy Director

**Inkrementelles Upgrade**, kein vollständiger Projektsnapshot. Enthält die Installer V874–V878 und die zugehörigen Payload-Dateien.

## Installation (Windows / PowerShell)

Vorher den Projektstand committen oder sichern. Die ZIP-Datei **in den Projektordner neben `package.json` entpacken**.

Falls V877 bereits installiert ist:

```powershell
node .\apply-v878.cjs
npm ci
npm run test:v878
npm run test:v878:types
npm run typecheck
npm run build
```

Falls die V874–V877-Upgrades fehlen, die Installer in **aufsteigender Reihenfolge** vor V878 aufrufen:

```powershell
node .\apply-v874.cjs
node .\apply-v875.cjs
node .\apply-v876.cjs
node .\apply-v877.cjs
node .\apply-v878.cjs
```

Die Installer sollen auf die vollständige Projektbasis angewendet werden, nicht auf andere entpackte Upgrade-Verzeichnisse. Bei nicht passenden Integrationsankern wird V878 ohne Änderungen abgebrochen. Die lokal vorhandenen Dateien werden **nicht** automatisch durch fremde Versionen ersetzt. `apply-v878.cjs` kann wiederholt ausgeführt werden.

## Neu in V878

1. **Sieben Publikumsstimmungen:** `calm`, `curious`, `engaged`, `singalong`, `anticipation`, `euphoria`, `finale`. Abgeleitet von der bestehenden verifizierten V810-Songabschnittssteuerung. *Mitsingen* wird nur als solche Stimmung ausgegeben, wenn V877 bereits eine Lyrics-Interaktion bestätigt.
2. **Energieglättung mit Songzeit statt Framerate:** geglättete vorhandene Audioenergie und Kickdaten mit Zeitkonstanten 360/800/1400 ms (direkt / ausgewogen / cinematographisch). Kurze Pegelspitzen führen nicht zu abrupten Schwankungen. Ein Mindesthaltefenster vermeidet Flattern innerhalb eines Abschnitts; bestätigte Abschnittswechsel bleiben sofort wirksam.
3. **Sicherer Seek/Track-Reset:** bei Trackwechsel, Zeitsprung >5 s, Rückwärtssprung, Pause, Blackout oder deaktivierter Publikumsszene wird der interne Verlauf zurückgesetzt. Kein Timer, keine Netzwerkabfrage und kein Hintergrunddienst.
4. **Mehr Dramaturgie durch Ruhe und Kontrast:** bestehende Jubel-, Arm-, Wellen-, Armband-, Choreografie- und Interaktionsstärken werden entsprechend der Songstimmung reduziert, *niemals über den von V874–V877 erlaubten Ausgangswert erhöht*.
5. **Dezente Publikumswellen:** nutzt die sechs vorhandenen Zuschauerbereiche und die bestehenden Körper-/Arme-/Armband-Instanzen. Keine neue Lichtquelle, kein Flash, keine weiteren Draw Calls, keine zusätzlichen Zuschauer. 72-Personen-Obergrenze und freie Mittellane bleiben bestehen.
6. **Concert FX Studio:** neuer Hauptschalter, optionale sanfte Emotionswellen, Kontrastregelung, Intensität 0–100 % und Reaktionstempo (Cinematisch/Ausgewogen/Direkt). Werte werden in der bestehenden Concert-FX-Einstellungsnormalisierung gespeichert; ältere Konfigurationen erhalten sichere Standardwerte.
7. **TypeScript-Fix für vorherige Upgrade-ZIPs:** Der Installer nimmt die beigestellten `v874/` bis `v878/`-Payload-Kopien in `tsconfig.json` unter `exclude` auf. Sonst werden die unverknüpften Installationsvorlagen vom globalen TypeScript-Check als zusätzliche Quelldateien mit geprüft. Die **realen** Dateien unter `components/visualizer/` sind **nicht** ausgeschlossen.

## Architektur und Sicherheit

V878 wird erst **nach** V815 (Publikum), V825 (Performance-Governor), V874 (Arme), V875 (Atmosphäre), V876 (Sektoren) und V877 (Musikinteraktion) angewendet. Die bestehenden Gating-Checks haben Vorrang: nicht spielender Song, unbestätigtes Music-Cue, manuelle Lichtregie, Blackout, Strobe-Sperre, reduzierte Bewegung, Low-Tier, deaktivierte Effekte, Lyrics- und Performer-Fokusschutz. V878 erkennt **keine tatsächlichen menschlichen Emotionen**, sondern steuert eine virtuelle, musikabhängige Publikumsdramaturgie anhand vorhandener Daten.

## Validierung

Erfolgreich auf einer **frisch entpackten V873-Vollversion** mit V874 → V875 → V876 → V877 → V878:

- **25/25 V878** Regressionstests (Stimmungswechsel, Hysterese, Glättung, Seek/Track-Reset, Overrides, Geometrie, UI/Installer und `tsconfig`-Exclude).
- V877 **26/26**, V876 **19/19**, V875 **16/16**, V874 **11/11**, V873 **181/181**, V868 **197/197**, V825 **50/50**, V815 **15/15**, V810 **30/30** gezielte Tests/Testgruppen bestanden.
- Gezielte V878-TypeScript-Prüfung `tsc -p tests/tsconfig.v878-core.json --noEmit` bestanden.
- Installer-Reihenfolge auf frischer V873-Basis geprüft; wiederholtes V878-Installieren führt zu **identischen Dateihashes**. Die V874–V878-Payload-Kopien sind aus dem produktiven TS-Projekt-Glob ausgeschlossen.
- TS/TSX-Syntax und mögliche Dateinamenkollisionen werden vor Paketfreigabe geprüft.

**Noch keine Produktionsfreigabe:** In der Prüfumgebung fehlen projektlokale `node_modules` (Next.js, React, Three.js und Node-Typen). Daher ist der vollständige `npm run typecheck` wegen fehlender Pakete **fehlgeschlagen**. `npm run build` wurde ausgeführt, blieb aber während der vorhandenen umfangreichen Prebuild-Tests innerhalb des Zeitlimits hängen und hat den Next.js-Compiler nicht erreicht. Auf Windows oder in GitHub Actions mit `npm ci`, vollständigem TypeScript-Check und Next.js-Produktionsbuild validieren. Bei CI-Fehlern die Logs prüfen, nicht ungeprüft veröffentlichen.
