# V286 – Stage Preset Library

Neue Funktion unter Settings → Dynamic Stage → Bühnen-Presets.

- Fünf voreingestellte Looks für Hardtekk, Industrial, Deutschrap, Galaxy und Chill.
- Eigene Looks (Bühnenstil, reaktive Beleuchtung und Lichtstärke) benennen, speichern, laden und löschen.
- JSON-Export und -Import eigener Looks mit Schema-Validierung, Dateigrößenbegrenzung und Mengenbegrenzung.
- Eigene Presets verbleiben lokal im Browser (localStorage); sie werden nicht mit Geräten synchronisiert.
- Eigene Presets sind unabhängig von der normalen Stage-Auswahl und werden über updatePreferences live übernommen.
- Die Bibliothek wird über `next/dynamic` erst bei der Nutzung der Settings geladen.

Test: `npm run verify:offline`, danach lokal mit installierten Abhängigkeiten `npm run build`.
