# Sonic Display V808 – Natural Performer Positioning

## Zweck

Die bestehende Auto-Regie erhaelt eine *freiwillige* Positionsfeinabstimmung fuer nachweislich einem Song zugewiesene Rapper. Duette, Rueckgaben (Reply/Handoff) und gemeinsame Hooks bekommen unterschiedliche, sanft eingeblendete Tiefenversatzbewegungen. Die X-Aufstellungs-Lanes bleiben unveraendert, sodass sich keine Rapper kreuzen.

## Verifizierung der Saenger

Der reine `planNaturalPerformerPositioningV808` akzeptiert ausschliesslich aktuell songgebundene V416/V496-Signale mit gueltigem Linienzeitfenster, eindeutigen Singer-Slots und passenden Rollenzuweisungen. Spotify-Credits oder Audio-Peaks duerfen nicht zu erfundenen Saengern werden. Die Steuerung lehnt Pausen, Reduced Motion, niedrige Qualitaetsstufe, manuelle Aufstellungen und nicht reproduzierbare Songdaten ab.

## Positionsbewegung

Die Rolle bestimmt einen kleinen Z-Zielwert: Leading-Performer dezent nach vorn, Partner leicht versetzt, Uebergabe als kurze Ruecknahme und Hook-Saenger in einer ruhigen Tiefenstaffelung. Ein- und Ausblendung erfolgt um die bestaetigte Passage. Versatz maximal 7,5 cm, keine X-Verschiebung und keine neue Animationsmixer/Render-Schleife.

- 3/4-Avatar-Pfad: `GroupDancersV326SceneV492.tsx` addiert den geprueften Wert direkt zum bestehenden `formationApproach`-Ziel. Vorher prueft V808 echte Rig-Roots, Abstaende (mindestens 1,5 Szeneneinheiten), V506/V508-Kollisionsrisiko, V322-Footlock und V494/V487-Kontakt-Evidenz. Bei beiden gepflanzten Fuessen, kritisch driftenden IK-Ankern oder crouch/low-pose wird die Bewegung ausgesetzt.
- 2-Avatar-Pfad: `DanceFormationActorsV492.tsx` verwendet die bereits vorhandene Duo-Formation. Ein im vorherigen Frame bestaetigter Vocal-Cue und die echten V506/V508-Risikowerte werden erneut gegen aktuelle Songzeit und Song-ID geprueft; nach einem Seek oder bei fehlendem Messwert wird die Bewegung deaktiviert. Da dort keine individuellen V494-Reports vorliegen, muss V322-Footlock ausgeschaltet sein. Der V324 Ensemble-Schutz ueberschreibt V808 stets.

Die echte V806-Kamera erkennt die anschliessend gemessenen Stage-Roots. V808 steuert weder die Kamera, die Lyrics, die Singer-Zuordnung noch GLB-Animationen oder Lippenbewegungen. Bestehende manuelle Timelines und Kollision/IK haben Vorrang.

## Grenzen

V808 ist keine physikalisch belastbare 3D-Kollisionserkennung. Die V506/V508-Berechnungen sind Naeherungen, der V487-Fusskontakt basiert auf IK-Ankerbeobachtung, und Einzelbilder wurden hier nicht im Browser/GPU abgenommen. Ohne gueltige Daten greift der Assistent bewusst nicht ein. Insbesondere bei weiterhin eingeschaltetem Duo-Footlock bleibt die Duett-Tiefenbewegung deaktiviert.

## Tests

`npm run test:v808`, `npm run test:v808:types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:lockfile:v752`. Gesamttyppruefung und Next.js-Produktion benoetigen die npm-Abhaengigkeiten und einen vollstaendigen Durchlauf.
