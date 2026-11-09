# V1139 · Govee-Alexa ohne Spotify

Bis V1138 verlangen die generischen /api/alexa/voice-pending und /voice-result Endpunkte eine aktive Spotify-Sitzung. V1139 ergänzt **separate**, strikt auf Govee-Power-Befehle beschränkte /api/alexa/govee-pending und /govee-result Endpunkte. Die Spotify-Endpunkte bleiben unverändert geschützt.

Zum Aktivieren einen langen, zufälligen Empfänger-Token erzeugen und als **Vercel server-side environment variable** `ALEXA_GOVEE_RECEIVER_TOKEN` speichern (32 bis 256 Buchstaben/Ziffern/_/-). Nicht den `ALEXA_BRIDGE_SECRET` verwenden. In **Einstellungen → Alexa → Govee-Alexa auch ohne Spotify** denselben Token im lokal vertrauenswürdigen Browser hinterlegen. Die schon vorhandenen Alexa-Empfangs- und Govee-Ein/Aus-Freigaben müssen ebenfalls aktiviert sein. Nach Änderung der Vercel-Variable neu deployen.

Der Govee-only Token wird nicht in URLs, Logs oder an Alexa übertragen. Gleiche Origin, Browser-Header, konstante Zeit bei Tokenvergleich, eng gefilterte Redis-Kommandos sowie claim-ID und Replay-Guards begrenzen die Berechtigung. Keine Künstler-/Display-/Spotify-Befehle ohne Spotify möglich. Der Browser muss sichtbar geöffnet bleiben; ein Pi-Dienst ohne sichtbaren Browser ist **nicht** Bestandteil von V1139.
