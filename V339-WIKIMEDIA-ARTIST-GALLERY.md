# V339 – Wikimedia Commons Künstlergalerie

Ergänzt die bereits vorhandene Spotify-Künstlerbildroute `/api/stage-content/artist?artist=...` um bis zu acht zusätzliche Motive aus Wikimedia Commons. Spotify bleibt Fallback. **Kein API-Key und kein QR-Code.**

Die Datei-Suche verwendet den MediaWiki Action API Endpoint von Wikimedia Commons, beschränkt sich auf Bilddateien mit Künstlernamen im Dateinamen und verwirft nicht unterstützte Medienformate, kleine Dateien und Bilder ohne einen erkennbar freien Lizenznamen. Freie Lizenz ist nicht gleich lizenzfrei: Autor, Lizenz und Quellseite werden für Einzelfotos auf der 3D-Leinwand eingeblendet. In Collage-Ansicht sollten Lizenznachweise zusätzlich über die Originaldateiseiten zugänglich gemacht werden, bevor das System öffentlich betrieben wird.

In `.env.local` lässt sich die Quelle deaktivieren: `STAGE_WIKIMEDIA_ENABLED=false`. Bei fehlgeschlagenem Netzwerkzugriff oder nicht passenden Treffern wird automatisch auf das Spotify-Bild zurückgegriffen. Wikimedia-Metadaten und Zuordnung sind nicht immer zuverlässig; auffällige Bilder sollten vor Veröffentlichung manuell geprüft werden.

Die vorhandene V338-Einstellung für Diashow/Collage/Einzelbild steuert weiterhin die Anzeige. Keine zusätzlichen Pakete benötigt. Beim Wechsel des Spotify-Tracks aktualisiert die bestehende Ladepipeline die Galerie automatisch.

Prüfung: `npm run test:v339`, danach `npm run verify:offline`. Vollständiger Build lokal mit `npm install && npm run build`.
