# V340 – Smart Image Selection

Intelligente Reihenfolge für Künstler- und Eventfotos aus Spotify, Wikimedia, öTicket und Ticketmaster. Keine QR-Codes.

- Auswertung der geladenen Bilddimensionen (natürliche Pixelgröße) im Browser.
- Bewertung von Auflösung und Verhältnis zu der 3D-Leinwand; zu kleine Bilder erhalten Punktabzug.
- Duplikate anhand kanonischer URL und Unterschiede bei Resizing-Parametern herausfiltern.
- Einfache Motivvielfalt durch Dateinamensheuristik; keine echte visuelle Ähnlichkeitserkennung.
- V340 lässt sich im Einstellungsbereich komplett abschalten. Ohne Messdaten werden Bilder nicht pauschal verworfen.
- Bildlizenzen und Wikimedia-Credits werden wie in V339 angezeigt.

Pfad: Settings → Dynamic Stage → Stage Content Plugins → V340 – Intelligente Bilderauswahl.

Tests: npm run test:v340, npm run verify:offline. Für Produktionsprüfung nach npm install: npm run build.

Grenzen: Externe Anbieter liefern nicht immer Bildabmessungen oder tatsächlich unterschiedliche Bildmotive. Kein tatsächlicher Blur- oder Gesichtsdetektor; Laufzeit im Browser wurde hier nicht visuell getestet.
