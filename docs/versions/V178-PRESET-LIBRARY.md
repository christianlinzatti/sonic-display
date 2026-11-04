# Sonic Display V178 – Lighting Preset Library & Version History

## Funktionen
- Optionaler Preset-Bibliotheksbereich im Lichtstudio; maximal 64 Einträge und 25 gespeicherte Versionen je Eintrag.
- Genre, Anzeigename und eine stabile lokale ID.
- Wiederherstellen lädt eine historische Version nur in den Editor. **Preset speichern** aktiviert sie; **Editor als neue Version sichern** legt einen neuen historischen Stand an.
- Export aller Einträge als JSON; Import bis 1 MB. Beim Import werden identische IDs durch importierte Einträge ersetzt, andere lokale Einträge bleiben erhalten.
- Löschen erfordert eine Bestätigung und entfernt alle Versionen des gewählten Eintrags.
- Speicherung erfolgt ausschließlich im `localStorage` des aktuellen Browserprofils. JSON-Export dient als Backup/Transfer zwischen Geräten.

## Testen
```bash
npm install
npm run test:preset-library
npm run verify:offline
npm run typecheck
npm run build
```

Hinweis: Der Import überprüft das Datenformat, aber nicht die Herkunft der JSON-Datei. Nur vertrauenswürdige Backups importieren.
