# V1154 – Konzertregie 3.0: Avatar und Govee

Die neue opt-in Koordination nutzt ausschließlich vorhandene Sonic-Display-Songdaten. Sie erweitert die vorhandenen V1134-Crew-Motive und V1027-Govee-Abschnittsübergänge ohne neue Songanalyse, externe KI-Aufrufe, Geräteanmeldung oder zusätzliche LAN-Timer.

## Aktivierung
Unter **Sonic Stage Crew → V1154 KI-Konzertregie 3.0** die Freigabe einschalten und die Intensität wählen. Standardwert: **aus**, Stärke 55 %. Änderungen funktionieren ohne Reload und werden nur im Browser gespeichert.

## Verhalten
- **Avatare:** In adaptiven Crew-Abläufen werden die bestehenden Expressionsfaktoren nach einem echten Clipwechsel sanft eingeregelt. Weder Clipwahl noch Sängerzuordnung, Bodenkontakt, Keyframes, manuelle Bewegungen oder Timeline ändern sich. Bei Rap-Text, Break und ruhiger Passage bleibt der Ausdruck zurückhaltender.
- **Govee:** Nur wenn bereits konfiguriertes LAN, ausgewählte Leuchten, laufende Musik, vorhandener Musik-Sync und ein gültiger verifizierter V318-Songabschnitt vorliegen, wird die vorhandene Helligkeit leicht *gedimmt*. Keine Aufhellung über die bestehende Grenze, keine neue Farbe, kein Power-On/Off, kein Strobo. Bestehende V1027/V1042/Room-Overlays, autorisierte Sprachsteuerung, eigene Show-Timelines und Geräte-Recovery haben Vorrang. Der V961-Governor bleibt die letzte Instanz vor der Bridge.
- **Bewegungsschutz:** Bei reduzierter Bewegung oder manueller Choreografie keine neuen Crew- oder Licht-Overlays.
- **Unbestätigte Phasen:** Die Crew kann auf Basis ihrer bisherigen lokalen Song-/Lyric-Beobachtungen sanfter werden; die Lampen erhalten bei unbestätigten Abschnitten keinen zusätzlichen V1154-Eingriff.
- **Performance:** Die Berechnung läuft im vorhandenen Crew- und Govee-Update. Keine zusätzlichen Netzwerkanfragen, Mikrofonfreigaben oder Render-Schleifen.

Die Koordination ist eine lokale deterministische Showplanung, kein generatives Cloud-KI-Modell. Reale Licht- und Bühnensynchronität müssen auf der Installation getestet werden.
