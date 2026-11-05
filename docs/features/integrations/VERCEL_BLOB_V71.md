# Sonic Display V71 – Vercel Blob

1. Vercel Dashboard → Storage → Blob: einen **Public** Store erstellen und mit dem Projekt verbinden.
2. Environment Variables setzen: `BLOB_READ_WRITE_TOKEN` (vom Store), `SONIC_ADMIN_PASSWORD` (mindestens 12 Zeichen), `SONIC_ADMIN_SESSION_SECRET` (mindestens 32 zufällige Zeichen).
3. Neu deployen. Settings → Avatar & Tanz → Administrator: anmelden.
4. GLB und Vorschaubilder hochladen, anschließend Metadaten bearbeiten und speichern.

Bei vorhandenem Blob-Token verwendet die App Blob statt lokaler Modelle/JSON; ohne Token verwendet sie lokale Dateien. Das lokale FBX→GLB benötigt weiterhin Blender. Uploads auf Vercel akzeptieren GLB, nicht FBX. Der Store ist **public**: Wer die Blob-URL kennt, kann das Modell abrufen. Keine privaten Assets hochladen.

Die Metadaten werden als versionierte JSON-Blobs gespeichert. Bei gleichzeitigem Bearbeiten von zwei Admin-Sessions kann die letzte Änderung die vorherige überschreiben; ältere JSON-Blobs bleiben erhalten. Für sehr häufige Änderungen empfiehlt sich später eine Datenbank.

Hinweis: Ein `SONIC_ADMIN_PASSWORD` allein genügt nicht; auch ein zufälliges `SONIC_ADMIN_SESSION_SECRET` ist erforderlich. Kein `NEXT_PUBLIC_` für Secrets verwenden.
