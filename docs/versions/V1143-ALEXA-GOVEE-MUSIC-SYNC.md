# V1143 · Alexa Govee-Musiklicht starten und pausieren

Sprachbefehle:

- „Alexa, sage Sonic Display, starte Govee Musiksynchronisation“
- „Alexa, sage Sonic Display, pausiere Govee Musiksynchronisation“

Der Befehl verändert ausschließlich die lokale Govee-`autoSync`-Einstellung und **weder Lampen-Ein/Aus noch Spotify-Playback**. Der Musikmodus funktioniert nur bei bereits eingerichtetem Govee-LAN-Bridge-Token und ausgewählten Lampen. Die Musik reagiert nur bei geöffnetem, sichtbarem Display mit aktiver Wiedergabe. Pause belässt die Lampen in ihrem bisherigen Zustand.

Eine eigene, zunächst deaktivierte Freigabe unter **Einstellungen → Alexa → V1143 Musik-Sync** ist erforderlich. Die bestehende Alexa-Power-Freigabe bleibt unabhängig. Manuelle Schalter im Touch-Lichtzentrum brauchen keine Sprachfreigabe.

Der Govee-only Voice-Empfänger ohne Spotify akzeptiert zusätzlich ausschließlich die zwei `govee-sync-*`-Kommandos. Ein Nutzer muss in der Amazon Developer Console das neue Interaktionsmodell importieren und die aktualisierte Lambda `voice-v1008.cjs` veröffentlichen.
