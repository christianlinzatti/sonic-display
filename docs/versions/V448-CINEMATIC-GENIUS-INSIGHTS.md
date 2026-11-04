# V448 – Cinematic Genius Insights

V448 erweitert die **bestehende optionale V447-Genius-Informationskarte** um abwechslungsreiche, platzsparende Präsentationen. Die Anzeige bleibt **in der Track-Spalte**; sie wird nicht über 3D-Avatare oder Lyrics gelegt. Kamera, Tanz, Lip-Sync, Choreografien und Vocal-Zuordnungen werden nicht verändert.

## Automatische Präsentationsmodi

- **Künstlerporträt / Albumcover:** Wenn Genius für den primären Künstler eine Bildadresse auf `https://images.genius.com` bereitstellt, wird ein Künstlerporträt gezeigt. Ansonsten verwendet die Karte das bereits vorhandene Spotify-Albumcover. Beides wird korrekt als Künstlerfoto bzw. Albumcover gekennzeichnet. Bei fehlendem Bild erscheint unmittelbar die normale Textansicht.
- **Credits:** Produzenten, Songwriter und Feature-Künstler erscheinen als einzelne dezente Namens-Chips, nacheinander weich eingeblendet. Die Namen stammen ausschließlich aus vorhandenen Genius-Credits.
- **Musikalische Verbindungen:** Wenn Genius eine Sample-, Interpolations-, Remix- oder Cover-Beziehung hinterlegt hat, erscheint eine kleine Beziehungsliste mit Quell-Links. Die Richtung der Beziehung steht explizit dabei (z. B. „Enthält ein Sample von“ bzw. „Wurde gesampelt in“). Es werden **keine erfundenen Jahre oder Chronologien** dargestellt.
- **Songgeschichten, Veröffentlichungen und Annotationen:** Weiterhin als kurze, lesbare Textkarten. Annotationen werden nur dann zur passenden Zeile angezeigt, wenn V447 diese anhand vorhandener synchronisierter Lyrics wirklich abgleichen kann.

## Timing und Prioritäten

- V447s zurückhaltendes Zeitfenster bleibt erhalten: frühestens nach 12 Sekunden, 11 Sekunden Anzeige innerhalb eines 28-Sekunden-Zyklus, anschließend 17 Sekunden Ruhe.
- Bei allgemeiner Story/Release-Info erscheinen verfügbare Bilder für maximal die ersten 4 Sekunden des Anzeige-Zyklus, anschließend die Textkarte. Credits und Samples haben eigene Layouts ohne überflüssige Bildwechsel.
- Bereits passende Lyrics-Annotationen behalten ihre V447-Priorität. **Keine** automatisch erfundenen Lyrics- oder Künstlerzeitstempel.
- Trackwechsel bricht vorhandene Requests ab und verwirft alte Ergebnisse (V447).
- `prefers-reduced-motion` sowie die interne UI-Einstellung `reducedMotion` unterdrücken alle neuen Foto-/Credit-Animationen.

## Bedienung

In **Einstellungen → Anzeige → Lyrics / Animation** gibt es zusätzlich zu `V447 · Genius Song Insights automatisch anzeigen` den Schalter `V448 · Cinematic Genius Insights (Fotos, Credits & Sample-Verbindungen)` (standardmäßig aktiviert). Bei ausgeschaltetem V448 erscheint unverändert die bisherige einfache V447-Karte.

Es sind keine neuen APIs, Konfigurationsdateien oder Abhängigkeiten nötig. Erforderlich bleibt nur `GENIUS_ACCESS_TOKEN` als serverseitige Umgebungsvariable, wie bei V447. Externe Bildquellen werden streng auf HTTPS und die Genius-Bilddomain `images.genius.com` beschränkt; das Spotify-Cover kommt aus der bereits vorhandenen Track-Antwort. Die Images werden nicht vom Server heruntergeladen oder zwischengespeichert.

**Lizenzhinweis:** Vor einer kommerziellen Veröffentlichung sind Rechte und Nutzungsbedingungen für Genius-Bilder, Texte und Annotationen sowie Spotify-Cover zu prüfen.

## Verifikation

```powershell
npm install
npm run test:v448
npm run verify:v448
npm run typecheck
npm run build
```

Die Offline-Regressionsprüfungen ersetzen keinen echten Live-Test mit Spotify/Genius und Browser-WebGL.
