# V1115 Release & Quality – AI Vocal Acting

## Benutzerablauf
1. Einstellungen → Bühne → 360° Arena → AI Show Designer → **V1115 AI Vocal Acting**.
2. Rap, melodisch oder Hybrid und Ausdrucksstärke wählen. **V1115 Vocal Acting jetzt proben**.
3. Die sieben Szenen, Rollenwechsel und fehlende verifizierte Sängerzuordnung lesen. Diese Vorschau ändert weder Geräte noch Einstellungen.
4. Optional und separat: **V1115 Vocal-Preset für vorhandene Lip-Sync-Engine aktivieren**. Überschreibt ausschließlich die in `vocalPresetV1115` aufgeführten existierenden Vocal-/Gestik-Einstellungen.
5. **Frühere Vocal-Regler wiederherstellen** (bei manuellen Änderungen verweigert die Automatik das Überschreiben).

## Tatsächliche Möglichkeiten
Die Szenenpartitur wird **nicht** als Live-Singer-Track ausgegeben. Für die drei mitgelieferten GLBs stehen Kopf- und Tanzanimationen bereit, jedoch keine eigenen Mundformen. Die vorhandene V368-VocalRig-Engine und ihre manuellen Singer-/Viseme-Zeitachsen bleiben zuständig. Bereits authentisch manuell zugeordnete Gesangsspuren behalten Vorrang. Der Showplan wird weiterhin ausschließlich separat bestätigt.

## Verifikation
- `npm run test:v1115` – echte kompilierte TypeScript-Funktion, 192 Genre-/Stil-/Limit-Kombinationen, Preset-Whitelist, Validierung, Songgrenzen und reale GLB-Rig-Fähigkeiten.
- `npm run test:v1115:types` – strikter isolierter Typcheck.
- `node scripts/v959-source-preflight.cjs` – bestehende vollständige Quellstruktur-Vorprüfung.
- `tests/e2e/ai-vocal-acting-v1115.spec.cjs` – reale Chromium Desktop/Touch Tests für Vorschau, explizites Preset und Rückgängig inklusive Screenshots. Wird mit bestehender CI ausgeführt.
