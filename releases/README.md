# Sonic Display V959 – ZIP-Import vom Handy

Dieser Ordner ist für den einmaligen Import des vollständigen V959-Projekts eingerichtet.

1. Im GitHub-Webbrowser diesen Ordner auf `master` öffnen.
2. **Add file → Upload files** auswählen.
3. Die ChatGPT-Datei `sonic-display-v959-parallel-production-validation-full.zip` hier hochladen (nicht nur verlinken).
4. Mit **Commit changes** direkt auf `master` bestätigen.

Anschließend startet der Workflow **V959 Import Complete Project ZIP**.
Er prüft ZIP-Integrität, Quell-Dateiliste, Release-Marker, Pfad-Sicherheit und Dateinamen-Kollisionen und übernimmt die Dateien in den Hauptbranch, ohne bestehende fremde Dateien zu löschen.

Der Import-Workflow startet danach explizit **V959 Parallel Regression and Production Build** für Linux und Windows. Ein fehlerhafter Import oder Build gilt niemals als erfolgreich.

Achtung: GitHub-Repository und dessen Commit-Historie sind öffentlich. Keine privaten Daten oder Zugangsdaten in die ZIP aufnehmen.
