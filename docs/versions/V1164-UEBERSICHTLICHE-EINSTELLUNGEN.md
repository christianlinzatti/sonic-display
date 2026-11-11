# Übersichtliche Einstellungen

## Schnellzugriff statt langer Einstiegsseite

Die Einstellungen öffnen beim ersten Aufruf den **Schnellzugriff**. Vier kompakte Karten bündeln Konzertregie und Effektstärke, Lyrics und ruhige Darstellung, Avatar-Auswahl und Outfit-Looks sowie Verbindungen. Die bekannten Einstellungen bleiben über die Bereichsauswahl erreichbar. Änderungen verwenden weiterhin die vorhandenen Preference- und Crew-Speicher; das Öffnen der Oberfläche startet keine Show, Aufnahme oder Govee-Verbindung.

Das Einstellungsfenster liegt über den übrigen Seiten-Widgets; der Hintergrund wird optisch gedämpft. Die Seitenleiste hat einen eigenen Scrollbereich. Mit Escape oder der Schließen-Schaltfläche kehrt man zur Bühne zurück.

Die Navigation gliedert sich in **Start**, **Show gestalten**, **Verbindungen** und **Technik**. Jeder Bereich hat eine kurze Beschreibung. Auf schmalen Bildschirmen ist die Bereichsauswahl seitlich scrollbar, damit die eigentlichen Einstellungen mehr Platz bekommen.

## Funktionssuche und Direktlinks

Ein lokaler, statischer Funktionsindex ergänzt die bisherige Kategorie-Suche: beispielsweise Garderobe/Kleidung, Lyrics/Schrift, Kamera, Fußkontakte und Timing. Mehrere Suchwörter werden gemeinsam geprüft; Großschreibung und Akzente unterscheiden die Ergebnisse nicht. Die Suche zeigt passende Direktlinks mit ihrem Zielbereich. Ein Klick führt in das bestehende Studio, markiert den betreffenden Abschnitt, scrollt ihn ins Bild und setzt den Tastaturfokus darauf. Andere Studios und manuell gespeicherte Werte bleiben erhalten. Auch die Bereichsseiten bieten ihre Direktlinks an.

Die Suche enthält kuratierte Funktionsnamen und Schlagwörter. Sie durchsucht keine Zugangsdaten oder frei eingegebenen Formularinhalte. Die bisherigen Detailstudios bleiben vollständig verfügbar; der Schnellzugriff ersetzt sie nicht.

## Konzertsteuerung nach Aufgaben

Unter **Show steuern** gibt es getrennte Gruppen für Bühne/Effekte, Crew/Outfits, Lyrics und Govee-Raumlicht. **Programm & Showvarianten** und **Timing & Kalibrierung** sind zunächst eingeklappt. Native `details`/`summary`-Elemente ermöglichen Bedienung per Tastatur und Touch. Das Schließen eines Abschnitts lässt seine Formularwerte und Komponenten bestehen. Die Aufnahme-Schaltfläche einschließlich „Aufnahme stoppen“ und Download bleibt außerhalb dieser eingeklappten Bereiche direkt erreichbar. Die globale Konzertprogramm-Regie und Aufnahmeverwaltung behalten ihre bisherige Lebensdauer unabhängig vom geöffneten Drawer.

Govee-Geräteauswahl, Freigaben, Musik-Sync und das Verhalten der Show werden durch diese Umordnung nicht verändert. Auf der Konzertfläche bleiben die beiden bisherigen Schaltflächen.

## Aufbau und Prüfung

- `lib/settingsNavigation.ts` definiert Bereiche, Gruppen, Suchbegriffe und Direktziele.
- `components/SettingsOverview.tsx` bindet die häufigen Regler an die bestehenden Speicher.
- `SettingsPanel.tsx` übernimmt Suche, Bereichsauswahl, Scrollen und Fokuswechsel.
- `ConcertSceneryControls` und `ConcertProgrammeControls` ordnen die vorhandenen Show-Regler nach Aufgaben.

`tests/e2e/settings-clarity.spec.cjs` prüft Schnellzugriff, gespeicherte Änderungen, Suchsprünge, keinen Treffer, Handy-Layout, Tastaturbedienung und das Beibehalten eingeklappter Programmeingaben. Bestehende Aufnahme-/Programme- und Kalibrierungstests öffnen die betreffenden Abschnitte ausdrücklich. Der neue Browser-Test ist Teil von `test:v1136:browser`. Spotify und Lyrics werden in diesen Browser-Prüfungen gemockt; die Govee-Regressionsprüfung nutzt eine Mock-Bridge. Testberichte werden nicht in das Projekt-ZIP aufgenommen.
