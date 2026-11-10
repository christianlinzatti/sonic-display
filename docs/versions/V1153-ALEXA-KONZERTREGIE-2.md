# V1153 – Alexa Konzertregie 2.0

V1152 ist bereits für natürliche Crew-Reaktionen und Showqualität dokumentiert; deshalb erhält die separate Alexa-Konzertregie die Versionsnummer V1153.

## Sprachbefehle

Die folgenden deutschen Alexa-Intents sind im Modell `integrations/alexa/interaction-model.de-DE.json` enthalten:

- „Wechsle die Konzertbühne zur Arena“
- „Wechsle die Konzertbühne zur Festivalbühne“
- „Wechsle die Konzertbühne zum Neon Club“
- „Setze die Konzertlichtstimmung auf Warm / Kühl / Neon / Automatisch“
- „Mache die Konzertshow ruhiger“
- „Mache die Konzertshow ausgeglichen“
- „Mach die Konzertshow intensiver“

Die drei Bühnenvarianten setzen **echte, vorhandene** 3D-Stage-IDs `arena360`, `festival` und `neon` und die passenden virtuellen V958-Konzertpresets. Lichtstimmungen ändern ausschließlich `voiceMoodV968` und damit das virtuelle Konzertlicht; die Intensitätsstufen 25, 55 und 80 ändern die virtuelle V958-Bühnenregie und die vorhandene 360°-Showintensität. Bei `reducedMotion` sind Werte auf maximal 40 begrenzt.

## Sicherheit und Rückgängig

Ein eigener V1153-Opt-in (standardmäßig deaktiviert) ist zusätzlich zum V1145-Show-Opt-in erforderlich. Die Befehle werden nur über die signierte Alexa-Voice-Queue angenommen, wenn der Auftrag aktuell und die **von Alexa gestartete** Konzertshow aktiv ist und in Spotify Musik läuft. Andere Live-Shows oder Benutzer-Timelines werden nicht verändert. Kein Govee-LAN-Aufruf, keine Lampen-Power-Befehle, keine Spotify-Wiedergabesteuerung.

Der browserlokale Snapshot speichert ausschließlich die tatsächlich von V1153 geänderten Schlüssel **vor** einer Änderung. Beim Beenden der V1145-Show werden zuerst V1153-Overrides, anschließend V1147 und V1145 wiederhergestellt. Nachfolgende manuelle Änderungen bleiben erhalten. Die vorhandene Option `hardwareSync` wird niemals aktiviert. Die Settings-Hilfe klassifiziert neue Befehle mit den beiden Freigaben und dem Showstatus.

**Externe Einrichtung:** Die aktualisierten Alexa-Lambda-Dateien und das de-DE-Sprachmodell müssen im AWS- beziehungsweise Alexa-Developer-Konto erneut veröffentlicht werden. Erst danach funktionieren die neuen Echo-Kommandos.
