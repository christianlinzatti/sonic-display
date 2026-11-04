# V343 – Visual Gallery Preview Editor

Die Galerie-Vorschau ist in **Settings → Dynamic Stage → Stage Content Plugins → V343** direkt unter den V342-Bewegungseinstellungen integriert.

- Künstlername eingeben und **Künstlerfotos laden**; verwendet die bereits vorhandene gesicherte API `/api/stage-content/artist` (Spotify-Sitzung erforderlich, Wikimedia optional).
- Alternativ mehrere eigene HTTPS-Foto-URLs eingeben und in der Vorschau anzeigen (nicht persistent gespeichert).
- Vorschau mit 16:9, 1:1 oder 3:4 und Galerie-Modi Diashow/Collage/Einzelbild.
- Wiederverwendung der Bühnen-Galeriekomponente inklusive echter V338–V342-Einstellungen, Bildnachweisen und CSS-Animationen.
- Einstellungsänderungen werden unmittelbar über die vorhandenen Browser-Events übernommen. Galerie-Modus in der Vorschau wird wie andere Galerie-Einstellungen gespeichert.
- Pausieren/Fortsetzen, Statusfeedback, Abbrechen vorheriger API-Anfragen und Fallback für fehlende Spotify-Sitzung.
- Keine QR-Codes; keine zusätzliche WebGL-Szene. CSS respektiert `prefers-reduced-motion`.

Hinweis: Die Vorschau zeigt nur Bilder, die tatsächlich von API oder Nutzer-URLs stammen. Sie führt keine automatisch erfundenen Fotodaten ein. Externe Live-API-Abfragen und Next.js-Produktionsbuild sind vor Deployment separat zu testen.
