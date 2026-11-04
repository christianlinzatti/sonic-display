# Sonic Display V372 – Unified Vocal Performance Director

**Ausgangspunkt:** vollständiges Sonic Display V371 · Version `0.1.0-v372`.

## Neuerungen

V372 bündelt die bereits vorhandene Lyrics-gesteuerte Mund-, Gesichts-, Kopf- und Gestensteuerung in einem gemeinsamen, deterministischen Berechnungsweg. Die beiden existierenden Renderer – prozeduraler Avatar sowie GLB mit Morph-Targets/Kiefer-Bone – verwenden `resolveCoordinatedVocalV372`. Damit basieren die einzelnen Zielposen auf der **gleichen Spotify-Position (inklusive des bereits bestehenden Lyrics-Offsets)** und demselben Rap-/Gesangsstil.

- **Wortbezogene Koordination:** V368 liefert die Vokal-/Mundbewegung, V369 formt die Gesichtsparameter und V371 liefert die begrenzten Kopf-/Gestenbewegungen. V372 kombiniert diese Kanäle ohne neue Audio- oder Netzwerkanfragen.
- **Betonungsübertragung:** Bei wortgenauen Zeitstempeln beeinflussen Kiefer-/Mundaktivität und das vorhandene V371-Betonungssignal in sehr kleinem Ausmaß Brauen, Wangen, Kopf und Gesten; alle Werte bleiben begrenzt.
- **Kalibrierung:** `avatarVocalCoordinationStrengthV372` (0–100 %, Standard 70) steuert die Betonungsverknüpfung. `avatarVocalCoordinationOffsetMsV372` (−200 bis +200 ms, Standard 0) verschiebt **beide Avatar-Kanäle** gleichzeitig, aber nicht den angezeigten Lyrics-Text. Für einen generellen Textversatz gibt es weiterhin den Lyrics-Offset.
- **Fallback:** Schaltet man V372 aus, werden die V368-/V369-Gesichtswerte und V371-Körperwerte ohne die neue zusätzliche Kopplung und ohne Zeitkorrektur berechnet.
- **Vorschau:** Die manuellen V370-Testposen und Rap-/Gesangs-Demos haben nach wie vor Vorrang vor Live-Cues.

## Verhalten & Grenzen

- **Wort-Timing:** Verstärkte Phrasenakzente nur bei tatsächlich gelieferten Wort-Zeitstempeln. Die Rap-/Gesangszuordnung verwendet die bereits vorhandene Heuristik aus Genre und Worttempo.
- **Nur Zeilen-Timing:** Schwächere visuelle Mundannäherung und V371-Kopfbewegung; keine künstlichen Wortgesten, kein forcierter Blickkontakt.
- **Pause, Seek in einen Bereich ohne Worte, Instrumental und Reduced Motion:** Neutrale Ziele. Die bereits vorhandenen zeitbasierten Dämpfungen der Renderer fahren die zuletzt angewendeten Overlays zurück.
- **Partnerbewegungen, Autoren-Choreografien und Hand-/Fuß-IK:** Haben weiterhin Priorität. Gesichtsmorphs werden additiv mit laufenden Clips kombiniert, sofern das Rig entsprechende Morphs besitzt.
- **Mehrere Tänzer:** Gleiche Songzeit und Mundformen je Wort; V371 hält gegensätzliche, dezente Gestenrichtungen je Avatar-Slot bei.

Dies ist **keine** phonetische Transkription, keine Stimmtrennung und keine Erkennung echter Sängermundbewegungen. Ohne Wortmarken bleiben die Bewegungen absichtlich zurückhaltend. Nicht alle GLB-Modelle besitzen kompatible Face-Morphs oder Bones.

## Benutzung

**Settings → Avatar & Tanz → V372 · Unified Vocal Performance Director**

- *Lippen, Mimik, Kopf und Gesten zusammen steuern*: ein/aus.
- *Zusammenspiel*: Abstimmungsstärke für die zusätzlichen, gemeinsamen Betontungsakzente.
- *Versatz für Tänzer*: gemeinsamer Zeitversatz für Lippen + Körper, −200 bis +200 ms.
- *Versatz zurücksetzen*: stellt 0 ms wieder her.

Die älteren V368–V371-Slider und das Gesichtsanimation-Studio V370 bleiben erhalten.

## Implementierung

- `components/visualizer/vocalPerformanceDirectorV372.ts` – reine Koordination; bindet V368, V369 und V371 ein.
- `components/visualizer/vocalStageExpressionV371.ts` – rückwärtskompatibles optionales Basis-Cue, um unnötige Stilunterschiede in der Koordination zu vermeiden.
- `components/visualizer/ThreeAvatar.tsx` – gemeinsamer Resolver für GLB und prozeduralen Avatar.
- `components/visualizer/VocalRigV368.tsx` – Morph-/Jaw-Renderer bezieht die V372-Gesichtspose; V370-Vorschauen bleiben separat.
- `components/visualizer/VisualizerStage.tsx`, `registry.tsx`, `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/SettingsPanel.tsx` – Einstellungen und Durchreichung.
- `tests/v372-unified-vocal-regression.cjs` – Unittests für Timing/Styling/Clamps/Stille/Multi-Avatar/Regressionen.

## Validierung

- `npm run check:syntax`: **PASS** – 495 TS-/TSX-Dateien.
- `npm run test:v372`: **PASS**.
- `npm run test:v367` ... `test:v371` und `test:v323`: **PASS**.
- 26 weitere fokussierte Tests für Kamera, Multi-Avatar, Tanz, Lyrics, Stage & Stabilität: **PASS**.
- `npm run build:preflight`: Ausgangsarchiv ohne `node_modules` und ohne `package-lock.json`. **Kein bestätigter Next.js-Production-Build.**
- Der ohne installierte Dependencies gestartete `tsc` meldet überwiegend Missing-Module-/Typfehler; dies ist **kein aussagekräftiger vollständiger TypeScript-Test**.

Auf deinem Entwicklungsrechner im ausgepackten Projekt:

```sh
npm install
npm run verify
```
