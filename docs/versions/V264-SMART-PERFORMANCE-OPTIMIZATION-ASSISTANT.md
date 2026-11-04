# V264 – Smart Performance Optimization Assistant

- Ergänzt V263 um Opt-in-Vorschläge bei vermuteter Avatar-CPU- oder Renderlast.
- Rendermodus Balanced/Low oder Multi-Avatar Director nur nach expliziter Bestätigung.
- Kontrollierte Vorschau durch Checkboxen, Rückgängig-Funktion für die letzte Übernahme.
- Keine automatische Reaktion auf vermutetes Heap-Wachstum.
- Keine Änderungen an Avatarwahl, Musik oder Animations-Clips.
- Diagnose ist heuristisch, keine Messung von GPU/CPU-Hardwareauslastung.

Prüfen: `npm run test:v264`, `npm run check:syntax`, anschließend mit installierten Abhängigkeiten `npm run typecheck && npm run build`.
