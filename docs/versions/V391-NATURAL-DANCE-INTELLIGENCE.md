# Sonic Display V391 – Natural Dance Intelligence 3.0

## Neu

- **Optionale V391 Flow-Variation:** musikalisch gebundene, aber leicht abwechslungsreiche Gewichtsverlagerungen, Hüft-/Oberkörper-Gegenbewegungen sowie arm- und schulterabhängiges Nachschwingen.
- **Genres:** Rap/Deutschrap folgt stärker der Snare und ist weicher; Hardtekk/Hardstyle/Techno hat schnellere, kickorientierte Akzente. Die Musikenergie und Abschnitte (Verse, Hook/Drop, Break) dämpfen bzw. verstärken die Variation.
- **Mehrere Avatare:** Jeder Auftrittsslot bekommt eine leicht versetzte Bewegungsphase, ohne einen neuen Beat-Takt einzuführen.
- **Fußkontakt-Schutz:** Bei eindeutigen *beidseitig freien* Fußkontakten können minimale rotationsbasierte Fuß-/Beinakzente entstehen. Sobald ein Fuß aufsetzt, die Kontakte unbekannt sind oder eine vorgegebene GLB-Choreografie läuft, gibt es keine neuen V391-Fußakzente. Die bestehenden Foot-Lock-/IK-Module V320/V322/V323 behalten Vorrang; **V391 implementiert keine neue globale Fußpositionskorrektur**.
- **Sicherheit:** Additive Rig-Kanäle statt Veränderung gespeicherter GLB-Keyframes. Keine Änderung von Root-Translation, IK-Zielkoordinaten, Lippenbewegungen oder musikalischem Transport-Takt. Pause, Reduced Motion, deaktivierte Funktion, Songwechsel und Seek setzen den Effekt zurück. Bei manuell vorgegebenen Clips wird die übrige Zusatzbewegung stark reduziert.

## Bedienung

Im bestehenden Natural-Dance-Bereich `V391 Flow-Variation aktivieren` auswählen. Mit `Variation` von 0 bis 100 % die Intensität einstellen; Standard **aus**, Stärke 55 %. Die Einstellung wird im Browser lokal gespeichert und ist über `V391 zurücksetzen` zurücksetzbar. Ohne aktivierte Funktion bleibt der frühere Animationspfad erhalten.

## Tests

`npm run test:v391` prüft das ausführbare Verhalten, Seiteneffekte, Pausen-/Seek-Resets, Rhythmus/Genres, Fußkontakt-Schutz und die Integration in GLB- und prozedurale Avatare. `npm run verify:offline` enthält V391 und 132 weitere Prüfbefehle. 133/133 wurden hier einzeln erfolgreich ausgeführt; die Syntaxprüfung deckt 522 TypeScript-/TSX-Dateien ab.

Ein vollständiger `npm run build` wurde in dieser Umgebung **nicht** verifiziert: `package-lock.json` fehlt und 16 der 17 npm-Abhängigkeiten sind nicht installiert. Nach `npm install` auf einem Rechner mit Internetzugang `npm run verify` ausführen.
