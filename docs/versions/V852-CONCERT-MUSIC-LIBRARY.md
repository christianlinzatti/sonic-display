# V852 – Concert Music Library

Modernisierung des Spotify-Playlist-Dialogs aus V851 auf Basis der bestehenden, abgesicherten APIs. Kein neues Spotify-Streaming, keine neue Berechtigung und keine Änderung am 3D-Show-Director.

## Was neu ist

- **Meine Musik** als kompakter, dauerhaft erreichbarer Button am unteren Displayrand, optisch passend zur Bühnendarstellung und räumlich vom Settings-Button getrennt.
- Elegante dunkle **Concert Library** mit Cover-Kacheln, Playlist-Hero mit Cover-Glow, Songliste, Leerzuständen und Ladeplatzhaltern.
- **Spotify Connect** als Geräteleiste statt einer schwer zu überblickenden Dropdown-Liste: aktives Gerät markiert, gewähltes Gerät hervorgehoben, gesperrte Geräte deaktiviert, Geräte aktualisieren, Hinweis bei fehlenden Geräten.
- **Ein-Klick-Start** direkt aus jeder Playlist-Kachel: Das gewählte Gerät wird verwendet, die Playlist muss dafür nicht zuerst geöffnet werden. Die große Play-Taste bleibt in den Details.
- **Gespeicherte Favoriten** übernehmen die bestehenden lokalen V851-Schlüssel unverändert. Favoriten-Stern, Suchfunktion, Pagination, Einzel-Titel-Start und Spotify-Links bleiben erhalten.
- **Mobil/Touch:** Scrollbare horizontale Playlist-Galerie, geräteabhängige Layouts, ausreichend große Schaltflächen; Rücksicht auf `prefers-reduced-motion`.
- **Zugänglichkeit:** Dialogtitel, Fokus-Rückkehr auf Startbutton, Escape, Tab-Fokusbegrenzung, Scroll-Sperre mit Cleanup, Statusmeldungen.

## Bedienung

Nach dem Spotify-Login unten **Meine Musik** öffnen, ggf. **Alle Playlists** wählen und mit dem Stern die bevorzugten Playlists merken. Oben das Spotify-Connect-Gerät wählen. Direkt über ▶ auf einer Kachel oder über die große Play-Taste starten; einzelne Songs lassen sich weiterhin aus den Playlist-Details starten.

Spotify Premium und ein über die Spotify-API sichtbares, nicht eingeschränktes Spotify-Connect-Gerät werden benötigt. Die Spotify-API kann bei manchen nicht selbst erstellten Playlists das Anzeigen der Titelliste einschränken; die Wiedergabe der Playlist wird davon getrennt gesteuert. Die Wiedergabe wird nur nach einem Benutzerklick gestartet.

## Prüfungen

- `npm run test:v852` – statischer UI-/Integrationsregressionstest.
- `npm run test:v851` und `npm run test:v851:types` – unveränderte API- und Helper-Tests.
- `npm run check:syntax`, `npm run check:architecture` – Projektstrukturgates.
- `npm run typecheck`, `npm run build` – vollständige Prüfung erst mit installierten Dependencies möglich.

**Nicht nachgewiesen:** Browser-Screenshot-/Layouttest im echten Next.js-Frontend, Spotify-Premium-/Connect-Test am echten Lautsprecher und vollständiger Produktionsbuild in dieser Offline-Umgebung.
