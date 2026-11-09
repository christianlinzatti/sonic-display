# V1140–V1142 · Verifizierte Govee-Statusabfrage und Touch-Lichtzentrale

## V1140: Bestätigter LAN-Status

Die lokale Bridge speichert `statusAt` ausschließlich beim Empfang einer echten Govee-`devStatus`-UDP-Antwort. `POST /status` liefert `fresh: true` nur, wenn nach dem Beginn der aktuellen Abfrage eine neue Geräteantwort eingetroffen ist und das Gerät als erreichbar gilt. Zuvor gespeicherte Werte und bloß erfolgreich versendete UDP-Power-Befehle sind **keine** bestätigte Lampenänderung.

## V1142: Schnelleinstellungen und Favoriten

Die Lichtzentrale zeigt bis zu vier einzeln auswählbare Kacheln, „Alle EIN/AUS“, manuelle Statusaktualisierung, Helligkeitsregler und vier Programme: Konzert-Musik-Sync, Hardtekk, Entspannen, Nacht. Sie erscheint unter **Steuerzentrale → Licht**, **Einstellungen → Govee** und ausklappbar in **Einstellungen → Alexa**. Weitere ausgewählte Lampen werden weiterhin durch die Sammelsteuerung erreicht.

Manuelle Farben/Helligkeit stoppen die automatische Musiksynchronisation, bevor Befehle gesendet werden; sie wird nicht heimlich wieder eingeschaltet. Nur die explizite Konzert-Schaltfläche aktiviert Auto-Sync. Statusabfragen erfolgen ausschließlich auf Nutzeraktion (kein zusätzliches Polling). Kein Spotify- oder Mikrofonzugriff durch neue Lichtbefehle.
