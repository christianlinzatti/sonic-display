# V441 – Multi-Avatar Artist Name Bubbles

## Ziel

Den Künstlernamen bei Solo- und Feature-Songs **automatisch und gut sichtbar** über dem zugehörigen Bühnenplatz darstellen. Möglichst keine Eingaben pro Song. Die Angaben stammen ausschließlich aus den im Track vorhandenen Spotify-Künstler-Credits; eine gesicherte Sänger-Erkennung oder Identifikation des Avatar-Aussehens wird nicht behauptet.

## Realisierte Funktionen

- `artistNameBubblesV441.ts`: Unabhängig testbare, begrenzte Anzeigeplanung; normalisiert und dedupliziert Namen, maximal 140 Zeichen Eingabe und 30 Zeichen sichtbares Label mit typografischer Kürzung; vollständiger Name im Tooltip.
- `ArtistNameBubbleV441.tsx`: DOM-basierte `@react-three/drei`-`Html`-Sprechblase, an die **bestehende 3D-Gruppe jedes Tänzers** angeheftet. Dadurch folgt die Beschriftung tatsächlicher Formation und Kameraposition. Nicht anklickbar, keine Audio-/Spotify-/Kamera-Schreibzugriffe. Bei reduzierter Bewegung keine CSS-Transitions.
- Automatische Anzeige bei den regulären Solo-, Duett- und V326-Gruppen-Tänzern. Die vorhandene V440-Automatik besetzt weiterhin maximal zwei Avatare; in manuell konfigurierten Gruppen können nur Slots mit vorhandenen Credits beschriftet werden, niemals erfundene Künstlernamen.
- Modus **Fokus** (Standard): Songstart beide Künstler, nach 4-Lyrics-Zeilen/visueller Phrase akzentuiertes Bühnenlabel, bei Duett/Hook beide. Diese Heuristik ist *keine Stimmerkennung*.
- Modus **Intro**: Start 4,5 s sowie Beginn musikalischer Abschnitte ca. 1,65 s; Lyrics-Zeilengrenzen bestimmen gegebenenfalls den Abschnittsbeginn.
- Modus **Immer**: Alle Namen gleichberechtigt hervorgehoben.
- Stile Comic / Neon / Minimal; Solo-Namen optional.
- Explizite V416-Lyrics-Rapper-Rollen und Hook-/Duett-Markierungen übersteuern den inferierten Fokus. V385 manuelle Vocal-Konfiguration deaktiviert die ungesicherte Solo-Hervorhebung und markiert beide Labels neutral.
- Sämtliche Einstellungen im bestehenden `AutoMotionIntelligencePanelV438` im Rap Performance Editor; persistieren über `UiPreferencesContext` ohne bestehende Einstellungen umzuschreiben.

## Grenzen

Die Zuordnung der Spotify-Credits zu Bühne 0/1 ist eine **visuelle Besetzung** und kein Nachweis, wer welche Lyrics spricht. Keine automatische Erzeugung oder Erkennung authentischer Künstlergesichter. V440 unterstützt weiterhin maximal zwei **automatisch hinzugefügte** Avatare. Überlappungen der Namenslabels bei extremen Kamera- oder Formationspositionen sind möglich; keine browserbasierte Kollisions- oder Screenshotprüfung. Drei-/Vierergruppen können nur für belegte, im Track vorhandene Credited-Slots Labels erhalten.

## Prüfung

`npm run test:v441` testet Anzeigeplanung und strenge TypeScript-Kernprüfung; `npm run verify:v441` enthält die unmittelbar vorhergehenden V437–V440-Regressionen, Syntax-, Import- und Module-Case-Prüfung und V190 Motion-Library-Prüfung. Zusätzliche Regressionen V423–V426 und V429–V436 separat geprüft. **Next.js Produktions-Build und WebGL-Sichttest nicht bestätigt**, solange npm-Abhängigkeiten hier fehlen.
