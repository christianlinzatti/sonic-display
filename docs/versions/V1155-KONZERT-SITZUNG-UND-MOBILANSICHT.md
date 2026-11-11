# Konzertmodus: Wiederaufnahme und kleine Displays

Der Konzertmodus merkt sich seinen Rückkehrpunkt jetzt im Sitzungsspeicher des
aktuellen Browser-Tabs. Nach einem Reload bleibt die Konzertansicht aktiv.
**Konzertmodus verlassen** beziehungsweise Escape stellt danach weiterhin die
vorherige Darstellung und die unverändert gebliebene temporäre Gruppe wieder her.
Der Rückkehrpunkt wird beim Verlassen entfernt. Bei gesperrtem Sitzungsspeicher
funktioniert der Modus weiterhin bis zum Neuladen.

Gespeichert werden nur fünf Anzeigeoptionen, die eigenen Crew-Schalter und die
Gruppenkonfiguration. Songtexte, Audiodaten, gelernte Vorlieben, Show-Verlauf und
Alexa-/Govee-Freigaben gehören nicht in diesen Rückkehrpunkt. Vorlieben und
Verlauf bleiben beim Verlassen erhalten. Änderungen an Einstellungen, die der
Konzertmodus nicht mehr besitzt, werden berücksichtigt: etwa ein anderer
Lyrics-Stil oder ein manuell gewählter Crew-Modus. Vor dem Lesen werden Schema,
Wertebereiche und Größe des Sitzungsdatensatzes geprüft; beschädigte Daten
aktivieren keine Wiederaufnahme.

Die automatische Kamera verkürzt ihren Abstand nur bei ausreichend breiter
Bühne. Schmale oder unbekannte Seitenverhältnisse behalten mehr Raum. Beide
Kamerapfade berücksichtigen das tatsächliche Canvas-Seitenverhältnis. Die
Basiskamera bekommt außerdem dieselbe tatsächliche Crew-Größe wie die übrige
Regie, damit die Rollenplanung auch bei drei und vier Figuren übereinstimmt.
Manuelle und geschützte Aufnahmen behalten Vorrang.

Für kurze Handy-Querformate erhalten Bühne und Lyrics eine eigene Höhenaufteilung
und kleinere, ruhig lesbare Rap-Schrift. Der Ausstieg berücksichtigt den sicheren
Displayrand. Schwebende Künstlerlabels werden in engen Ansichten ausgeblendet,
damit keine abgeschnittenen Namen ins Bild ragen. Lange Lyrics können innerhalb ihrer Zone gescrollt werden, ohne die
Bühne zu verschieben.

## Prüfungen

- `tests/concert-session.cjs`: gültige/defekte Sitzungen, begrenztes Schema,
  Erhalt gelernter und manueller Einstellungen, konservative Hochformat-Kamera
  und unveränderte geschützte Aufnahmen.
- `tests/e2e/concert-resume.spec.cjs`: Reload und vollständiger Ausstieg,
  Vorlieben/Verlauf und manuelle Stiländerung, echte Drei-Avatar-Bühne sowie
  lesbare Rap-Zonen bei 390 × 844 und 844 × 390 Pixeln. Spotify und Lyrics sind
  gemockt. Desktop und Touch werden geprüft.
- Die vorhandenen Konzert-, Körperhaltungs-, Crew- und Qualitätsprüfungen sowie
  die mit dem Pull geholten Alexa-/Govee-Regressionen bleiben erhalten.

Die Projekt-ZIP enthält Quellcode, Figuren und Dokumentation. Playwright-Berichte,
Build-Ausgaben und installierte Abhängigkeiten werden ausgeschlossen.
