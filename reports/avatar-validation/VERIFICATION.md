# Sonic Stage Crew – Prüfung des Musik- und Showpakets 4

Stand: 8. November 2026. Die GLB-Modelle und zwölf Clips pro Figur aus Paket 3 bleiben
unverändert. Paket 4 ergänzt deren Steuerung im vorhandenen Live-Renderer und eine
als solche gekennzeichnete Show-Simulation.

## Planung mit echten GLBs

`director.log` dokumentiert neun Szenarien: drei Modi bei jeweils 80, 120 und 180 BPM.
Jedes Szenario läuft 40 Sekunden über 2.400 Zeitpunkte mit drei tatsächlichen
Three.js-GLB-Mixern (insgesamt 21.600 Zeitpunkte bzw. 64.800 Mixer-Auswertungen).

- Gemeinsamer Tanz: alle drei wählen denselben vorhandenen Clip und dieselbe Phase.
- Kanon: House-Clips bleiben um jeweils zwei Beats versetzt.
- Wechselnde Solos: die tatsächlich gewählte Signature-Animation gehört zum jeweils
  vorgesehenen Solo-Slot, auch bei höherem Tempo.
- Füße und Rig-Werte bleiben bei den ausgewerteten Modell-Posen endlich.
- Clip-Auswahl für ruhige Abschnitte, Strophe, Refrain, Drop und Genre wird geprüft.
- Manuelle Priorität, Reduced Motion, deaktivierte Steuerung, fehlende Uhren/Clips,
  Songwechsel und Zeitsprünge sperren bzw. setzen die Planung korrekt zurück.
- Die Zeitintegration bleibt bei Tempoänderungen kontinuierlich; es wird nicht
  rückwirkend der ganze Song auf einen neuen BPM-Wert skaliert.
- Kurze Abschnittsschwankungen starten keine dauernden Clip-Wechsel.
- Der Wechsel von Solo zu Trio setzt die bisherige Solo-Haltezeit zurück.
- Kopf-/LED-Overlays akkumulieren auch ohne neue Mixer-Pose nicht über 1.000 Schritte
  und geben ihre eigenen Werte beim Deaktivieren wieder frei.
- Deaktivierte Reaktionen verhindern auch Novas Intro-Begrüßung.

Die Live-Anbindung verwendet den vorhandenen Mixer und die bestehende Crossfade-Pipeline.
Die Crew-Phase wird vor den bestehenden Rig- und Fußkorrekturen angewendet. Es entstehen
keine zusätzlichen Live-Mixer, keine Änderungen an Original-Tracks und keine neuen
Bewegungen der Bühnen-Wurzelpositionen oder Füße durch die Reaktionsschicht.

## Browser und Produktion

Der finale Next.js-Produktionsbuild einschließlich TypeScript-Prüfung besteht
(`production-build.log`). Bekannte Autoprefixer-Hinweise im vorhandenen Stylesheet
bleiben bestehen. Die vollständige historische Prebuild-Kette wurde nicht ausgeführt.

**Finaler Browserlauf: 16/16 bestanden, 0 fehlgeschlagen, 0 übersprungen, 0 flaky.**

Der abschließende Browserlauf steht in `../playwright-avatars/results.json` und
`playwright.log`. Der HTML-Bericht mit echten Screenshots liegt in
`../playwright-avatars/html/index.html`.

Zusätzlich zu den bisherigen Avatar-Tests werden auf Desktop und iPad-Touch geprüft:

- Persistenz der Crew-Einstellungen nach erneutem Laden.
- Einrichten des Trios mit den drei richtigen Modell-IDs und Rücknahme zu vorherigen
  Modellen, Gruppenmodus, Visualizer und Crew-Einstellungen.
- Echte 3D-Wiedergabe aller drei GLBs in der klar bezeichneten Simulation.
- Sichtbare Animationsänderung, gemeinsame Clips, Kanon-Zeiten und genau eine Solo-Rolle.
- Pause mit unveränderten Clip-Zeiten.
- Reduced Motion über den tatsächlichen Schalter „Anzeige → Reduce motion“ und
  deaktivierter Start der Show-Simulation.
- Keine Browser-Laufzeitfehler, fehlenden App-Chunks oder unerwarteten externen Browser-Anfragen.

Die bestehenden Prüfungen bleiben enthalten: Katalog und lokale Dateien, alle zwölf
Clips je Figur, längere Signature-Tänze, Gesichts-/Handansichten, gespeicherte Auswahl,
feines Scrubbing, schnelle Clip-Wechsel und Bewegungsreduktion im Dance Studio.
Die Tests starten einen echten Produktionsserver (`next start`) und lokalen Chromium
mit SwiftShader.

## Modellqualität und weitere Regressionen

`assets.log`, `motion.log` und `personality.log` bestätigen die unveränderten Modelle:
44/45/47 Gelenke, 13.060/14.048/14.232 Dreiecke, je 940 gemischt gewichtete Vertices,
20 bewegliche Fingersegmente, echte Gesichts-/LED-Bewegungen und 12–16-s-Signatures.
Die gebackene Fußarbeit, Loop-Enden und privaten Ressourcen bestehen weiterhin die
bereits enthaltenen Prüfungen.

Die relevanten vorhandenen Regressionen V328, V492 (Blending-Presets), V530, V534,
V536 und V1009 sind bestanden. V530/V536 verwenden kontrollierte Clip-Metadaten;
der neue Director-Test wertet zusätzlich die tatsächlich mitgelieferten GLBs aus.
Die komplette historische Gesamttestkette wurde nicht ausgeführt. Der bereits in
Paket 2 dokumentierte V491-Fehler in einer Erwartung an `build:preflight` wurde nicht
als Teil dieses Updates umgebaut.

Die React-Prüfung berücksichtigt bedarfsgeladenen 3D-Code, gecachte Rig-Referenzen,
versionierte lokale Einstellungen, Zeitwerte in Refs und gedrosselte Statusanzeigen
der Simulation, Ressourcen-Freigabe, beschriftete Eingaben und eine wiederholbare 3D-Fehlerbehandlung.

## Grenzen der Aussage

Es wurde keine echte Spotify-Sitzung gestartet und keine Audioaufnahme analysiert.
Die Live-Verbindung ist an die vorhandenen App-Daten angeschlossen; die kontrollierte
Simulation und die Mixer-Tests prüfen die Bewegungslogik mit expliziten Eingaben.
Unbekanntes Tempo verwendet 120 BPM. Bestehende Abschnitts-/Tempo-Schätzungen bleiben
Schätzungen; eine korrekte absolute Ausrichtung an realen Lautsprecher-Beats hängt
von diesen vorhandenen Daten ab. Echte Publikums-/Applauserkennung wird nicht behauptet.
Andere manuelle Direktoren und Reduced Motion behalten Vorrang.
