# V1145 – Vollständige 360°-Konzertshow über Alexa

Sprachbefehle:
- **„Alexa, sage Sonic Display, starte die komplette Konzertshow“**
- **„Alexa, sage Sonic Display, beende die komplette Konzertshow“**

## Umsetzung

V1145 nutzt die **vorhandene**, durch V958 normalisierte Konzertregie und die bereits eingebaute 360°-Bühne (V1031–V1071). Die Aktivierung kombiniert bestehende Module für 360°-Bühne, Avatar-Performance, die über mehrere Songphasen gesteuerte Arena-Regie, Konzertszenen, immersive virtuelle Effekte, Smart Concert Flow und Bühnenübergänge. Es wird **keine zusätzliche, parallele Show-Engine**, kein neuer Spotify-Poll und kein neuer Audio- oder Animations-Loop installiert.

Der neue Alexa-Intent läuft über die bestehende AWS-Lambda-Skill-ID- und Benutzerprüfung, das signierte Relay `/api/alexa/voice` und die Spotify-authentifizierte, sichtbare Empfangsschleife. **Der Govee-only-Empfänger ohne Spotify akzeptiert V1145 absichtlich nicht.**

Die **separate, standardmäßig ausgeschaltete Show-Freigabe** findet sich unter **Einstellungen → Alexa → V1145**. Eine lokale Vorschau ist dort auch ohne Alexa-Integration möglich. Der Showstart erfordert einen **bereits laufenden Spotify-Titel**; V1145 darf keine Spotify-Wiedergabe starten, anhalten oder zur nächsten Nummer wechseln.

## Was geschützt bleibt

- Bestehende **manuell erstellte Timelines, Shows und Bühnen-Presets** werden nicht gelöscht oder ersetzt.
- **Reduzierte Animationen** bleiben maßgeblich: die Bühnenrotation wird in diesem Fall ausgeschaltet.
- V958 **hardwareSync** wird durch Alexa nicht aktiviert. Govee erhält keinen direkten Schaltbefehl.
- **Govee-Musiksynchronisation** wird nur aktiviert, wenn der Nutzer zusätzlich „Govee bei Showstart“ sowie die unabhängige **V1143 Alexa-Musik-Sync-Freigabe** gewählt hat **und** die Bridge mit ausgewählten Geräten konfiguriert ist. Ansonsten bleibt Govee unverändert. Keine Lampen werden eingeschaltet.
- Der vorherige Zustand der tatsächlich von der Show übernommenen Felder wird gesichert. **Beenden** stellt diese wieder her, **sofern keine späteren manuellen Änderungen vorliegen**; Alexa schaltet weder Spotify noch physische Lampen aus.
- Ein doppelter Start wird nicht erneut angewendet. Abgelaufene oder widerrufene Sprachnachrichten werden abgelehnt.

## Einmalige Amazon-Aktualisierung

Nach erfolgreichem Build das neue Skill-Modell `integrations/alexa/interaction-model.de-DE.json` im Alexa Developer Portal importieren und die aktualisierte `integrations/alexa/voice-v1008.cjs` gemeinsam mit `integrations/alexa/handler.cjs` in der bestehenden AWS Lambda bereitstellen. GitHub/Vercel aktualisieren den Amazon Skill **nicht automatisch**.
