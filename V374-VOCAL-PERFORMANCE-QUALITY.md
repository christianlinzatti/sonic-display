# Sonic Display V374 – Vocal Performance Quality Engine

**Basis:** vollständiges Sonic Display V373. **Version:** `0.1.0-v374`.

## Funktionen

- **Weichere Wort-/Vokalform-Übergänge:** Die V374-Qualitätsschicht sampelt bei vorhandenen Wort-Zeitstempeln benachbarte berechnete Mundformen und mischt sie mit dem aktuellen Gesichts-Zielzustand. Sie schützt den aktuellen **M/B/P-Lippenverschluss** vor Übersprechen. Die echte GLB-Ansteuerung verwendet weiter den vorhandenen V370-Profileditor, die V369-Kiefer-Koordination und das V368-Morph-Overlay.
- **Weniger hektische Rap-Gesten:** Bei kurzen Wortabständen werden Armimpulse zurückgenommen. Phrasenenden, Ausrufe und ausgewählte Ankerwörter behalten mehr Betonung. Kopfimpulse bleiben sanft erhalten; Gesang wird nicht durch den Rap-Filter verändert.
- **Optische Multi-Avatar-Regie:** `Gemeinsam` reduziert übermäßige Parallelgestik, `Lead + Begleitung` betont den primären Avatar und `Phrasenwechsel` rotiert die visuelle Hauptrolle pro vorhandener Lyrics-Zeile. In einer Solo-Szene ist die Rollenverwaltung neutral. Unterstützt auch die tatsächliche Anzahl von Tänzern in der Gruppenansicht.
- **Bühnenübergreifend:** Die prozedurale Figur und importierte GLB-/GLTF-Tänzer verwenden denselben V374-Resolver, der auf dem V372-Coordinator aufsetzt. Die V373-Lyrics-Diagnose zeigt nun ebenfalls die qualitativen Zielwerte und den Gestenfaktor an. In einer rein visuellen Vorschau lassen sich Solo, Duo oder vier Tänzer und ein einzelner Tänzer-Slot zum Rollenvergleich wählen, ohne die eigentliche Bühnengruppe zu ändern.
- **Sicherheit / Grenzen:** Pause, Reduced Motion, Instrumental und reine Zeilenzeitstempel verursachen keine zusätzlichen Wort-Gesten. Der Schalter *Natürlichere Vocal-Performance aktivieren* liefert bei Deaktivierung die unveränderten V372-Animationswerte zurück. Die Schicht besitzt keine Timer, keine Netzwerkanfragen und keine Spracherkennung.

## Einstellungen

`Settings → Avatar & Tanz → V374 · Vocal Performance Quality Engine`:

- Natürlichere Vocal-Performance aktivieren (Standard: ein)
- Weiche Mundform-Übergänge: 0–100 % (Standard: 65 %)
- Rap-Gesten beruhigen: 0–100 % (Standard: 70 %)
- Auftritt mit mehreren Tänzern: Gemeinsam / Lead-Tänzer + Begleitung / Phrasenweise wechselnde Hauptrolle (Standard: Lead)

Einstellungen werden mit den bestehenden Browser-UI-Präferenzen gespeichert. V370-Profile, V371-Bewegungen, V372-Timing-Versatz und V373-Inspector bleiben bestehen.

## Architektur

`components/visualizer/vocalPerformanceQualityV374.ts` ist eine pure Funktion `resolveVocalPerformanceQualityV374(lyrics, progressMs, playing, options)`. Sie übernimmt die zeitlich koordinierten V372-Zielwerte, mischt nur kompatible Mundformen und dämpft die abgeleiteten Gesten gemäß dem Worttempo und der rein visuellen Avatar-Rolle. Das Ergebnis beinhaltet `qualityV374` mit Rolle, Schnellwort-Indikator, Gestenfaktor und Mund-Mischwert. Die Bühne wird in `ThreeAvatar.tsx` und `VocalRigV368.tsx` angebunden; die Zustandsweitergabe erfolgt über `VisualizerStage.tsx` und `registry.tsx`. Die Einstellungen sind im `SettingsPanel.tsx` und `UiPreferencesContext.tsx` enthalten.

**Einschränkung:** Die Engine verwendet ausschließlich zeitmarkierte Song-Lyrics und Genre-/Worttempo-Hinweise. Sie kann weder echte Phoneme oder Stimmen extrahieren noch bestimmen, welcher Künstler tatsächlich singt. Eine *Lead-Rolle* ist eine künstlerische Bühnenentscheidung. Die reale Morphqualität hängt vom jeweiligen GLB-Modell und dessen Zuordnungen ab.

## Tests / Verifikation

- `npm run check:syntax` — Quellcode-Syntaxprüfung.
- `npm run test:v374` — Wortübergänge, Rap-Gesten, Solo-/Multi-/Call-Response-Rollen, Instrumental, Wort-/Zeilentiming, Pause, Reduced Motion, Abschaltbarkeit, bestehende Pipeline und UI-Anbindung.
- `npm run test:v367` … `npm run test:v373` — Rückwärtskompatibilität der älteren Vocal-Features.
- 62/62 gezielte Kamera-, Multi-Avatar-, Lyrics-, Show- und Vocal-Regressionstests bestanden.
- 498 TS/TSX-Quelldateien parse-geprüft.
- Der Testlader unter `tests/typescript-loader.cjs` verwendet nach `npm install` bevorzugt das lokal installierte `typescript` (z. B. unter Windows); nur in diesem Linux-Testcontainer erfolgt der bekannte globale Fallback.
- `npm run verify` — gesamte Offline-Regressionsreihe, TypeScript-Check und Production-Build (benötigt zuerst `npm install` mit Netzwerkzugang).

Im bereitgestellten Quellarchiv sind bewusst keine `node_modules` und kein `package-lock.json` enthalten; die hier durchgeführten Syntax-/Unit-Tests beweisen **keinen** vollständigen Next.js-Production-Build.
