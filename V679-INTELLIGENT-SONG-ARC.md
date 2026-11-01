# V679 – Intelligent Song Arc Director

## Funktion

V679 baut **auf V671 auf** und plant erstmals einen expliziten, priorisierten
Haupt-Höhepunkt über die *gesamte* bestätigte Songstruktur. Statt benachbarte
Hook-/Drop-Wiederholungen immer weiter aufzudrehen, verteilt die Planungsfunktion
höchstens zwei räumlich getrennte Nebenhöhepunkte, eine zurückhaltende
Vorbereitung direkt vor einem bestätigten Höhepunkt und einen Kontrast zu
vorhandenen Breaks. Kein Break oder Drop wird durch die Laufzeit allein erfunden.
Ein Haupt-Höhepunkt wird nur aus tatsächlich bestätigten Hook-/Drop-Labels
gewählt; sofern mehrere existieren, bewertet die Planung den Zeitpunkt, eine
unmittelbar vorangehende belegte Build-Passage sowie die Wiederholung.

Die Architektur verwendet **ausschließlich** `fullSongPlanV604` und
`fullSongPacingPlanV671`. V679 vergleicht vor jeder Anwendung die Bestätigungen
von V604 und V671 mit der aktuellen Position. Fehlt die Übereinstimmung, läuft
die bisherige Konzertregie ohne zusätzliche V679-Akzente weiter. Die neuen
Tanz-/Kamera-/Licht-Gain-Faktoren liegen jeweils zwischen **0,975 und 1,025**;
Abschnittsgrenzen sind weich geglättet. Bei aktiver Lyrics-Priorität und
Balancing-Profil werden die Faktoren weiter reduziert. V670 bleibt die letzte
Qualitätsgrenze. Manuelle Kamerafahrten, Choreografien und Lichtschalter bleiben
maßgeblich. Eine echte Prüfung von gerenderten Pixeln erfolgt nicht.

## Oberfläche

`Unified Track Analysis` (`TrackAnalysisControlsV318.tsx`) zeigt zusätzlich
„V679 · Intelligent Song Arc“: zeitlich proportionale Farbbalken für belegte
Abschnitte, markierten Haupt-Höhepunkt sowie Ruhe-, Aufbau- und andere
Bewegungsphasen. Ohne geeigneten importierten Songverlauf wird der fehlende
Beleg ehrlich angegeben. Keine neue Einstellungsoption, Netzwerkverbindung,
Persistenz, Mikrofonnutzung oder Zusatzberechtigung erforderlich.

## Tests

`npm run test:v679`, `npm run test:v679:types`, `npm run test:smoke:v679`.
Zusätzlich `npm run check:syntax`, `npm run check:architecture`,
`npm run test:module-case`, `npm run typecheck` und `npm run build`.
Ein vollständiger Produktionsbuild mit installierten React-/Next.js-Abhängigkeiten
ist vor Einsatz auf Zielhardware noch erforderlich.
