# Phase 2 · Mixamo Ensemble Regression Foundation

- Ergänzt gezielte Regressionen für die vorhandene Mixamo-Show-Cue-Auswahl.
- Hook/Drop verwenden bei mehreren Avataren eine gemeinsame Phrase nur, wenn für den jeweiligen Avatar tatsächlich geeignete Mixamo-Library-Clips geladen sind.
- Verse/Build/Intro/Break behalten individuelle Auswahl; Lead/Support-Rollen bleiben unterscheidbar.
- Genre-Bias für Hardtekk wird gegen Rap-Clips geprüft; Nicht-Mixamo-Clips erhalten keinen Mixamo-Sonderbonus.
- Keine Änderung an manuell gewählten Clips, Rig-Retargeting, Fuß-IK oder Wiedergabe-Timing.

- Die KI-Choreografie kann nun optional die tatsächlich geladenen Clipnamen je Avatar entgegennehmen.
- Vorschläge werden separator-/case-insensitiv auf vorhandene Clips aufgelöst; zurückgegeben wird ausschließlich der originale GLB-Clipname.
- Fehlt ein passender Clip, bleibt die Empfehlung leer statt einen nicht vorhandenen Clip zu erfinden.
- Die bisherige Vorschlagslogik bleibt rückwärtskompatibel, wenn keine Clip-Liste übergeben wird.
- V1114-Regression ergänzt: unterschiedliche Repertoires je Avatar, alternative Schreibweisen, fehlende Clips und ungültige Repertoire-Daten.
