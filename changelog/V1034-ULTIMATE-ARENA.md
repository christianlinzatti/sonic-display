# V1034 – Ultimate 360° Concert Experience (2026-11-06)

## Neue Funktionen

- **Zweite bewegliche Bühnenebene:** Ein dekorativer, äußerer LED-Ring außerhalb der zentralen Avatar-Tanzfläche auf dem Hauptdeck wird sanft (maximal 27 cm) angehoben und relativ zur bereits drehenden Plattform rotiert. Künstler und Avatar-Rigs verbleiben bewusst auf dem festen Zentrum des Hauptdecks, wodurch Foot IK, Tanzformationen und bestehende Bühnenbewegungen unberührt bleiben. Kein echtes mechanisches Podest.
- **Intelligente Abschnittsregie:** Reproduzierbare Inszenierungspläne für Verse, Hook, Drop, Build und Break (mit Refrain-/Chorus- und Intro-/Outro-Synonymen). Wenn keine Abschnittserkennung vorliegt, wird nicht spekulativ ein Drop erzeugt: dezenter Verse-Modus.
- **Lichtformationen über dem Publikum:** 16/32/48 dekorative LED-Bausteine (low/balanced/high) um den feststehenden oberen Arenaring. Lichtfokus, Fächer, Spiral-, Halo- und Drop-Formationen. Nur ein GPU-Instancing-Batch, keine zusätzlichen Schatten oder echten Scheinwerfer; farbliche Änderungen mit begrenzten 8–15 Hz, keine Strobo-Impulse.
- **Abschnittsabhängige Kamera:** Schmale, nur für autorisierte automatische Kamerapositionen gültige Distanz-/Höhen-/FOV-Änderungen. Beide vorhandenen Kamera-Owner verwenden `composeArenaSectionCameraV1034` und respektieren manuelle, Timeline-, Lyrics- und Gesangs-Aufnahmen sowie Pause und reduzierte Bewegung.
- **Einstellungen:** Vier unabhängige Schalter; neue Optionen haben gültige Defaults bei älteren gespeicherten Präferenzen. Bestehende V1031–V1033-Optionen bleiben unverändert.

## Code / Validierung

`lib/arena360ShowV1034.ts` ist eine reine Logikdatei mit Normalisierung, Abschnittsplänen, Delta-gedeckeltem Lift, budgetierten Sky-Fixtures und geschützter Kamerakomposition. `components/visualizer/stages/ArenaSkyFormationV1034.tsx` setzt die feststehenden oberen LED-Formationen um. `components/visualizer/stages/Arena360StageV1031.tsx` ergänzt die innere Ebene ohne Verschieben der Avatare. `tests/v1034-ultimate-arena-regression.cjs`, `tests/tsconfig.v1034-core.json` und `scripts/v1034-release-readiness.cjs` kontrollieren Verhalten, Integration und CI-Metadaten.

Die bestehende `v1032-live-arena-validation.yml` führt zusätzlich die V1034-Tests auf Linux und Windows aus. Der separate V1034-Workflow ist absichtlich nur manuell startbar, damit pro Push keine zusätzlichen redundanten automatischen Workflows erzeugt werden. Der Produktionsbuild und der visuelle WebGL-Test mit echten Avataren benötigen die installierten Projekt-Abhängigkeiten und CI/Browser-Ausführung.
