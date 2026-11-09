# V1144 · Govee-Statuszuverlässigkeit

Das Govee-Licht-Dashboard versucht bei einer ausbleibenden frischen Statusantwort genau **eine** zusätzliche, nur lesende `/status`-Abfrage pro ausgewähltem Gerät. Auch bei Bridge-Timeouts oder kurzzeitigen HTTP-503-Problemen bleibt die Zahl der Abfragen auf maximal zwei begrenzt. Ein abgelehnter Token, eine ungültige Auswahl oder geänderte Konfiguration unterbricht weitere Versuche.

**Keine automatische Wiederholung von UDP-Ein/Aus, Farb- oder Helligkeitsbefehlen.** Ein vom UDP-Socket erfolgreich versandter Befehl bestätigt noch nicht den Hardware-Zustand. Deshalb zeigt die Lichtzentrale nur nach einer frischen `devStatus`-Antwort „bestätigt EIN/AUS“. Ansonsten bleibt der Status unbekannt. Die letzte manuelle Statusprüfung und die Zahl unbestätigter Geräte sind sichtbar. Es entsteht kein neues Hintergrund-Polling.
