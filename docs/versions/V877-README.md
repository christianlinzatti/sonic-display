# Sonic Display V877 – Intelligent Crowd Interaction 4.0

**Inkrementelles Upgrade** mit V874–V877-Installern, **kein vollständiger App-Snapshot**.
Auf der greifbaren **V868-Vollbasis** und sequenziell installierten V874/V875/V876-Versionen getestet. Die nicht vorliegende vollständige V873-Basis sowie andere individuell angepasste Stände sind nicht vollständig verifiziert.

## Windows-Installation

1. Projekt per Git committen/sichern. Dieses ZIP in das Projekt-Hauptverzeichnis (neben `package.json`) entpacken.
2. Nur noch fehlende Installer ausführen. Für eine bereits installierte V876 reicht `node .\apply-v877.cjs`.

```powershell
node .\apply-v874.cjs     # nur falls V874 fehlt
node .\apply-v875.cjs     # nur falls V875 fehlt
node .\apply-v876.cjs     # nur falls V876 fehlt
node .\apply-v877.cjs
npm ci
npm run test:v877
npm run test:v877:types
npm run typecheck
npm run build
```

Ältere Installer nicht nachträglich nach V877 ausführen: Sie können ihre eigenen Komponenten wiederherstellen. Danach alle neueren Installer erneut in der richtigen Reihenfolge anwenden. Der V877-Installer prüft exakte Integrationsanker, verweigert abweichende vorhandene Payload-Dateien und ist bei unveränderter Installation wiederholbar, ohne weitere Änderungen.

## Funktionen

- **Hook/Mitsingreaktion:** Virtuelle Zuschauer reagieren auf den Beginn *tatsächlich zeitgestempelter*, sichtbarer Lyrics-Zeilen. Ohne `synced`-Zeitmarken keine vorgetäuschte Call-&-Response-Erkennung. Texte werden nicht analysiert, gespeichert oder an Services übertragen.
- **Deutschrap-Response:** Dezent unterschiedliche Antwortbewegungen für die Verse bei überprüfter Song-/Lyrics-Taktung; keine automatische Sprecher- oder Phonemerkennung.
- **Performer-Fokus:** Die sechs Publikumssektoren folgen einem bereits überprüften Lead-Performerslot aus V797; es gibt **kein** neues Personen-/Gesichts-Tracking.
- **Rhythmisches Ensemble-Echo** bei mehreren Darstellern, Drop-Cheers, Finale-Wellen sowie reaktive Sektorverschiebungen. Keine echte Erkennung individueller Tanzelemente oder Avatar-Bones.
- **Concert FX Studio:** Ein Hauptschalter, drei Einzelschalter (Rap/Mitsingen, Performer-Fokus, Ensemble-Echo), Intensität 0–100 %, Stil Dezent/Ausgewogen/Lebendig. Alle Einstellungen sind Teil der bereits bestehenden normalisierten Concert-FX-Konfiguration.
- **Performance:** 72 vorhandene Zuschauer, **keine zusätzlichen Draw Calls, Instanced-Meshes, dynamischen Lichtquellen, Audioanalysen, Timer oder Renderer**. Pro-Person-Bewegungen werden nur zum bestehenden 20-Hz-Crowd-Update berechnet und im bestehenden Scratch-Objekt gespeichert.
- **Sicherheit:** Die V877-Regie folgt *nach* dem V825-Performance-Governor und den V874–V876-Cues. Respektiert Blackout, reduzierte Bewegung, pausierte/unbestätigte Tracks, manuelle Lichteingriffe, Low-Tier, ausgeschaltete Publikumseffekte und Lyrics-Sichtbarkeit. Körper bleiben in den beiden Seitenbereichen, maximal 8,5 cm seitliche Abweichung.

## Prüfungen

**Erfolgreich auf V868 + V874 + V875 + V876 + V877:**

- V877: **26/26** gezielte Planner-, Lyrics-, Fokus-, Safety-, Geometrie-, Installer- und Integrationstests.
- V876: **19/19**, V875: **16/16**, V874: **11/11**, V868: **197/197**, V825: **50/50**, V815: **15/15**, V810: **30/30** Tests und Testgruppen erfolgreich.
- Zielgerichteter `test:v877:types` erfolgreich (`tsc --noEmit`), TSX-Syntax der sechs geänderten Dateien erfolgreich.
- Frische Entpackung von V868 mit sequenzieller V874–V877-Installation erfolgreich; erneuter V877-Installerlauf bei gleichem Stand ohne Änderungen. Keine `.ts/.tsx`-Dateinamenskollisionen gefunden.

**Nicht produktionsfreigegeben:** Hier fehlen `node_modules` (u. a. React, Next.js, `@types/node`). Der globale `npm run typecheck` meldet deshalb zahlreiche fehlende Module. Der komplette `npm run build` konnte in dieser Umgebung nicht erfolgreich beendet werden; die umfangreiche Prebuild-Prüfkette erreichte nicht den Next.js-Produktionscompiler. Zur Freigabe ist auf deinem Windows-Rechner bzw. in GitHub Actions ein vollständiger `npm ci && npm run typecheck && npm run build` notwendig.
