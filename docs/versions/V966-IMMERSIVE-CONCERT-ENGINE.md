# Sonic Display V966 – Immersive Concert Engine 3.0

## Sichtbar neue Funktion

Optionales atmosphärisches 3D-Set im **bestehenden** `ConcertFestivalFxV958`:
seitliche durchscheinende Raumlichtkegel, Lichtstreifen, Bodenglows,
Bühnenbogen, sanfter Hintergrunddunst und visuelle Publikumsrandbeleuchtung.
Die Motive passen sich bestätigten Verse/Hook/Build/Drop/Break/Outro-Segmenten
und Deutschrap/Hardtekk/Hardstyle/Deutschrock-Farbpaletten an.
Kein echter volumetrischer Shader / keine Steuerung des physischen Publikums.

## Einschalten

Im *Ultimate Concert Experience Studio* zunächst „Intelligente Konzertregie“
und „Virtuelle 3D-Bühneneffekte“, dann „V966 Immersive Konzertatmosphäre“
aktivieren. Der neue Schieberegler (0–100 %) steuert ausschließlich
virtuelle transparente Zusatzgeometrie. Beide Optionen sind standardmäßig AUS.

## Schutzmaßnahmen

- Bindung an **bestätigte V318-Songabschnitte** mit Confidence >= 0,75.
- Keine virtuellen Zusatzeffekte bei Pause, fremden Track-IDs,
  manuellen V354-Bühnen-Scores oder niedriger Performance-Stufe.
- Zusatzeffekte werden am Abschnittsanfang/-ende weich ein-/ausgeblendet.
- Reduzierte Bewegung sperrt die wenigen passiven Animationsschritte.
- Keine zusätzlichen Netzwerkrequests, Animation-Frames, Timers, Strobes,
  Kamera-Override, Govee-Sends oder Spotify-Wiedergabebefehle.
- Keine zweite Crowd- oder Effekt-Autorität: ausschließlich Kulissenbeleuchtung.
- Noch keine Alexa-Verknüpfung: dafür muss in einer Folgerelease ein separater
  Skill mit sicherer Befehlsauthentifizierung konfiguriert werden.

## Prüfung

`node tests/v966-immersive-concert-regression.cjs`

`tsc -p tests/tsconfig.v966-core.json --noEmit`

`node tests/v966-project-structure-regression.cjs`

Die GitHub-Produktionsprüfung umfasst zusätzlich den vollständigen TS-Check
und Next.js-Build. Nicht mit dem älteren bloßen Strukturtest verwechseln.

## ZIP-Import

Die bereits auf `master` installierte ZIP-Import-Automation prüft weiterhin
`releases/SonicDisplay-V965.zip` und `sonicRoadmapRelease=v965`. Daher bleibt
die ZIP aus Kompatibilitätsgründen zunächst auf **V965** benannt; **V966**
bezeichnet den enthaltenen Featurestand. Vor dem Umstellen des Release-Markers
soll der GitHub ZIP-Importer versionsunabhängig gemacht werden.
