# Sonic Display V1148 – Kontextabhängige Alexa-Hilfe

**Ziel:** Die Alexa-Hilfe unter **Einstellungen → Alexa** zeigt weiterhin alle Kommandos des
deutschen Interaktionsmodells, jetzt ergänzt durch den **lokalen Freigabestatus pro Befehl**.

- **Lokal vorbereitet:** Die lokal auslesbaren Freigaben und Grundvoraussetzungen stimmen. Das ist **keine** Aussage über Alexa-Skill-Auslieferung, AWS Lambda, Redis, Spotify-OAuth-Scopes oder einen erfolgreich ausgeführten Govee-Hardwarebefehl.
- **Nicht lokal vorbereitet:** Zu jedem Befehl wird die aktuell fehlende Berechtigung oder Voraussetzung angezeigt (z. B. „Alexa-Empfang einschalten“, „Spotify verbinden“, „V1145 Konzertshow freigeben“, „Govee-Empfänger-Token hinterlegen“).
- **Alexa-Skill erforderlich:** Hilfe, Abbrechen, „Letztes Ergebnis“ und andere nur vom Skill bearbeitete Befehle werden nicht als lokal getestet ausgegeben.
- **Nur lokal vorbereitete Befehle anzeigen:** Optionaler Filter, zusätzlich zur bestehenden Suche nach dem echten Sprachmodell.

Die Statusauswertung ist eine **reine lokale Funktion ohne Netzwerk, Timer und Schreibzugriffe**. Das
React-Panel reagiert auf die vorhandenen Storage-/Opt-in-Events; es pollt weder AWS noch Spotify noch
die LAN-Bridge zusätzlich. Vorhandene Grenzen gelten weiter: Govee-Kommandos nutzen nur ausgewählte
Lampen; externe Skill-Veröffentlichung und physische Lampenreaktionen können nicht vorausgesagt werden.

**V1147-Buildfix:** Der V1008-Receiver-Regressionstest nutzt eine zusätzliche, inaktive Mock-Abhängigkeit für
`alexaConcertScenesV1147`. Das behebt die neue CI-Fehlermeldung, ohne den produktiven Alexa-Empfänger
oder seine Sicherheitsfreigaben zu verändern.
