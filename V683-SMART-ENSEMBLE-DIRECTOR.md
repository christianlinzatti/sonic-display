# V683 – Smart Ensemble Director

## Funktion

V683 ergänzt die bereits existierende automatische Bühnenregie für **drei oder vier** GLB-Performer.
Erzeugt werden **keine** neuen Charaktere, Zeitmarken, Tanzclips oder Sänger-Zuordnungen. Stattdessen
werden ausschließlich bereits automatisch generierte und an den aktuellen Titel gebundene
V442/V446-Gruppencues aus **belegten, zeitlich eindeutigen** V681-Songabschnitten verfeinert.

- **Verse:** Solofokus auf den *bereits vorhandenen visuellen* Fokus-Slot – keine Stimmenerkennung.
- **Erster Hook:** Breites Gruppenbild; wiederholte Hooks können eine dialogartige Aufstellung wählen.
- **Bestätigter Haupt-Höhepunkt / Drop:** Breites Ensemble ohne weitere frei erfundene Drops.
- **Build:** Halbkreisaufstellung; **Break:** ruhigere Linie.
- **Dialog:** Zwei Performer können leicht hervorgehoben werden. Dies ist eine **visuelle Formation, keine Stimmenerkennung** oder Gesangszuordnung.

Der V326-Abstandsregler bleibt aktiv; V609 steuert das bestehende weiche Blending. Die
V683-Eingriffe erzeugen weder neue Cuts noch neue Timestamps. Manuelle Bühnen- und
Choreografievorgaben, Singer Assignments, Kamera (V682), Lyrics und Lip-Sync bleiben unangetastet.
Ein Song mit nur ein oder zwei Avataren nutzt weiterhin die bisherigen Solo-/Duett-Funktionen.

## Bedienung

- Automatisch bei eingeschalteter Smart-Show und automatisch erzeugter 3-/4-Personen-Gruppe,
  sofern zeitlich bestätigte Songabschnitte importiert wurden.
- **Unified Track Analysis → V683 Smart Ensemble Director:** lesender 4-Personen-Beispielplan.
- Kein zusätzlicher Berechtigungsschritt, kein Netzwerkabruf, keine Speicherung.

## Technische Grenzen

Der Plan basiert auf importierten, validierten Abschnittslabels und nicht auf Echtzeit-
Stimmenseparation. Spotify-Künstler-Credits liefern **keine Stimmenerkennung**. Die Abstandsprüfung
sichert Bühnen-Wurzelpositionen ab; pixelgenaue Verdeckung, ungewöhnliche GLB-Proportionen und
Lyrics-Overlay-Kollisionen müssen auf dem Zielbildschirm zusätzlich visuell geprüft werden.

## Tests

`npm run test:v683`, `npm run test:v683:types`, `npm run test:quick`,
`npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`.
Mit installierten Abhängigkeiten außerdem `npm run build`; ohne erfolgreichen Next.js-Build
noch keine Produktionsfreigabe.
