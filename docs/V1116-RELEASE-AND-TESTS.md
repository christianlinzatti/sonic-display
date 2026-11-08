# V1116 Release & Tests – AI Artist Interaction

## Bedienung
1. Einstellungen → Bühne → 360° Arena → AI Show Designer → **V1116 AI Artist Interaction**.
2. Einen Stil wählen (Dialog, Duo, Rap-Battle oder Festival) und **V1116 Künstlerinteraktionen jetzt proben** betätigen.
3. Sieben geplante Interaktionen, Kamerawechsel, Lead-/Partnerrollen und aktuelle Szene lesen. Diese Vorschau schreibt keine Einstellungen.
4. Optional **V1116 vorhandene Live-Artist-Interaktion aktivieren** (separate Zustimmung): setzt nur die bekannten V1079-Parameter. Der Live-Modus reagiert ausschließlich auf tatsächlich synchronisierte Lyrics-Lücken.
5. **Frühere Live-Interaktion wiederherstellen** macht die separate Einstellung nur rückgängig, wenn diese seit der Zustimmung unverändert geblieben ist.
6. Den angezeigten V1040-Kameraplan bei Bedarf über **In meinen Showplan übernehmen** speichern; Zeitgrenzen bleiben dabei erhalten und bestehende Undo-Funktion greift.

## Prüfungen
- `npm run test:v1116` – compiliert echte TypeScript-Dateien und testet 256 Kombinationen aus Genre, Interaktionsstil, Stärke und Intensitätsgrenze, fehlerhafte Daten, unveränderte Quellwerte, Rollen-/Phasenwechsel, echte V1079-Freigabefelder.
- `npm run test:v1116:types` – strenger isolierter Typcheck.
- `node scripts/v959-source-preflight.cjs` – vollständiger bestehender Source-Preflight.
- Desktop-/Touch-Browser-E2E mit Playwright: `tests/e2e/ai-artist-interaction-v1116.spec.cjs` inklusive zweier PNG-Evidenzen. Muss im GitHub-Actions-Produktionslauf ausgeführt werden.
- Wegen der aktuell installierten lokalen Node-22-Umgebung ist die Node-24-Next.js-Produktion nicht durch diese lokalen Tests zertifiziert.

## Funktionsgrenzen
Die Interaktionspartitur enthält choreografische Absichten; sie löst keine individuelle Kopf-/Augenanimation in den drei GLB-Avataren aus. Der separate V1079-Modus nutzt nachgewiesene Lyrics-Lücken und bestehende Animationseffekte, keine automatisch erkannten Singer, keine realen Govee-Befehle und keine neuen externen Anfragen.
