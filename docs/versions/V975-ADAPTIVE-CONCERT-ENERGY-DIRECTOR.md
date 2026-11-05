# V975 – Adaptive Concert Energy Director

Die virtuelle Bühnenshow folgt einer gebundenen, weichen Energiekurve für verifizierte V318-Abschnitte: Verse ruhiger, Hooks voller, Builds zunehmend, Drops betont, Breaks und Outros reduziert. Innerhalb der bestätigten Abschnitte sorgt eine langsame Kurve für Abwechslung ohne harte Sprünge. Keine neue Audioanalyse und keine Vorhersage zukünftiger Songabschnitte.

Im **Ultimate Concert Experience Studio** ist die Funktion standardmäßig deaktiviert (Opt-in). Modi: Dezent, Ausgewogen, Filmisch; Intensität: 0–100. Freigabe benötigt `enabled`, `virtualFx`, bestätigte V318-Section, laufende Wiedergabe und gültige Zeitangaben.

**Sicherheitsgrenzen:** Nur Änderungen an bestehenden `ConcertSceneV958.intensity`, `spotlight`, `lightGain`; Kamera, Formation, FX-Liste, Phase, Palette und Timeline bleiben identisch. Vollständig blockiert bei manueller Bühne, gespeicherter Show, authored Timeline Cue, reduzierter Bewegung oder niedrigem Performance-Profil. Bei sichtbaren Lyrics werden alle Schwankungen halbiert. Keine neue Timer-/Render-Schleife, keine Govee- oder Alexa-Commands, kein Web-Fetch.

**Tests:** `npm run test:v975` und `npm run test:v975:types`; in beiden bestehenden Produktions-Gates ergänzt. Der vollständige `npm run typecheck` und `npm run build` benötigt alle installierten Pakete unter Node 24; CI muss diese noch separat bestätigen.

**V974-Import-Cleanup:** Der versionsunabhängige GitHub-Importer aus dem mittlerweile gemergten PR #4 bleibt als geschützte GitHub-Datei erhalten und wird auch im Gesamtarchiv mitgeführt. Der Release-Marker lautet `v975`, die `package.json.version` bleibt aus Kompatibilitätsgründen unverändert.
