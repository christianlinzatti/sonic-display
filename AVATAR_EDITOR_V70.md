# V70 Avatar Metadata Editor

Settings → Avatar & Tanz → Avatar-Bibliothek → <Modell> bearbeiten. Speichert Label, Beschreibung, Preview, Genres, Tags, Kategorie, Favorit und Dance Preset nach data/avatars.local.json. Nur auf localhost/127.0.0.1 bei `npm run dev`; keine Server-Schreibzugriffe auf Vercel. Bestehende Einträge anderer Modelle bleiben erhalten. Keine automatischen Backups: sichere die JSON-Datei vor größeren Änderungen.

Die Modelle müssen unter public/avatars/ liegen. `avatarModels.default.ts` bleibt unverändert.
