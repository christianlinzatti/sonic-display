# V550 Verification – Cinematic Concert Camera 4.0

**Projektstand:** 0.1.0-v550, aus V549 weiterentwickelt.

## Nachweislich abgeschlossene Prüfungen

- Neuer `test:v550`: **9.720 gültige** deterministische Kombinationen, **9.136** akzeptierte, konservativ überprüfte Feinänderungen: 3.240 Solo-, 3.125 Handoff- und 2.771 Ensemble-Kompositionen. Außerdem manuelle Priorität, nicht bestätigte Sänger, Seek/Grenzwerte, fehlende/ungültige Avatar-Roots, hochkant/quer, Lyrics links/rechts/zentral, V540-Grenzen und deterministische Auswertung.
- `test:v550:types`: isolierte TypeScript-Prüfung der neuen Kamera inklusive V528/V540-Typen.
- **Alle 29 Funktions- und 29 TypeScript-Kernprüfungen V522–V550** einzeln erfolgreich (insgesamt 58 erfolgreiche Befehle).
- `npm run verify:v550` erfolgreich; `check:syntax` erfolgreich (**766** TS/TSX-Dateien); `check:architecture` erfolgreich (**296** aktuelle Quellreferenzen).
- Projekt-ZIP wird auf Einträge und CRC geprüft, Quellordner `node_modules`, `.next` und Original-GLBs nicht enthalten.

## Bewusste Grenzen

- Bei Messung handelt es sich um reine, deterministische Projektion **realer Bühnenanker plus angenommene** Körperhöhen. Keine tatsächlich aufgenommenen Pixel, keine visuell bestätigten Rapper-Nahaufnahmen oder Kollisionsfreiheit.
- Der **vollständige Next.js-Produktionsbuild ist nicht bestanden/nicht durchgeführt**: `next` ist in der Laufzeit nicht installiert, `node_modules` und `package-lock.json` fehlen. Reine Kern-TypeScript-Prüfungen ersetzen diesen Build nicht.
- Die fünf GLB-Testfixtures werden bei den vorhandenen Testläufen strukturell geprüft; sie gehören nicht zum Projekt-ZIP. Tatsächliche Rap-/Hardstyle-Live-Prüfungen auf dem Raspberry Pi sind offen.
- Die aktuelle Bühne kann zwei bis vier Sänger gleichzeitig darstellen. In der Assetbibliothek dürfen mehr Modelle vorhanden sein.

## Lokale Wiederholung

```bash
npm install
npm run verify:v550
npm run typecheck
npm run build
```

Für die visuelle Abnahme: identischen Deutschrap-Track mit bestätigtem V547-Lead/Feature sowie Gruppen-Hook abspielen, Kamera/Lyrics im Live-A/B-Vergleich V544 kontrollieren, FPS/P99 auf dem Raspberry Pi mit V543 prüfen. Testfälle mit manuell editiertem V400/V432-Shot müssen unberührt bleiben.
