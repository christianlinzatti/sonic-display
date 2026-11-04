# Sonic Display V555 – Concert Stage Details

**Basis:** V554 (Lyrics-Provider-Auswahl mit Wort- vor Zeilensynchronisierung). Alle bisherigen Dateien und Musikfunktionen bleiben erhalten.

## Sichtbare Verbesserungen

- **Gobo**: leicht bewegte geometrische Linien und Rasterschnitte auf dem Bühnenboden, keine Spot-/Schatten-Maps.
- **LED-Pixelwand**: grobe, per Shader gezeichnete LED-Punkte hinter den Avataren. In Hooks grafische Muster; bei dichten Zeilen gedrosselte Wirkung.
- **Flacher Bodennebel**: eine sehr transparente, weiche bodennahe Fläche ohne teure Partikelwolken. Der bestehende V308-Nebel bleibt unverändert.
- **Duett-Lichtbogen**: wiederverwendete Liniengeometrie zwischen zwei tatsächlich vorhandenen V377-Performer-Ankern, begrenzt auf 950 ms nach einem manuell/verifiziert belegten Übergang aus V528. Fehlen Rollen, Avatare oder passende Zeitmarken, passiert nichts. Kein Laser.
- **Adlib-Echo**: kurze dezente Textkopien neben der Haupt-Lyrics-Anzeige, nur bei markierten Phrasen wie `(Hey)` oder `[adlib:Hey]` in der aktiven Zeile. Ein Provider muss diese Markierung tatsächlich liefern; es wird keine Adlib-Stimme erkannt.
- **Hook-Projektion**: nur dekorativ ein einzelnes Wort aus der aktuellen Textzeile bzw. dem verfügbaren Wort-Timestamp, auf der Rückwand, zusätzlich zur unveränderten Hauptanzeige.
- **Reim-Akzent**: dezente Unterstreichung wiederkehrender ähnlicher Wortendungen im betrachteten Kontext. Die dreibuchstabige Endung ist nur eine graphische Näherung, kein Sprach-/Reimlexikon. Funktioniert auch bei zeilenweise synchronisierten Lyrics; bestehende Wortzeitmarken werden nicht verändert.

## Bedienung

Einstellungen → Bühne → **Konzert-Bühneneffekte · V555**: Gesamtschalter, sieben einzelne Optionen, Stärke 0–100 %. Einstellungen sind browserlokal wie die übrigen UI-Präferenzen. Standard 45 %. Reduzierte Bewegung deaktiviert die Bewegungsanimation, Lichtverbindungen, Projektion und Adlib-Echo; Low-Tier reduziert bzw. deaktiviert die GPU-Effekte.

## Technische Grenzen

- Keine KI-Erkennung von Adlibs, Personen oder Reimschemata. Abschnittsquelle ist die vorhandene Stage-Section oder eine bestätigte Hook-Vokalrolle. Der Duettbogen erfindet keine Ankerpositionen.
- Keine zusätzliche Audio-Analyse, kein Timer, keine neuen Datenprovider, kein Canvas neben R3F.
- Tests: `npm run test:v555`, `npm run test:v555:types`, `npm run check:syntax`, `npm run check:architecture`, plus V551/V552/V553/V554 Regressionen.
- Wegen fehlender `node_modules` konnte **kein vollständiger Next.js-Produktionsbuild und kein realer Raspberry-Pi/WebGL-Bildtest** durchgeführt werden. Optische Feinjustierung auf dem echten 10-Zoll-Display bleibt ausständig.
