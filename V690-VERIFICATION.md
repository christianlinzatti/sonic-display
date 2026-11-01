# V690 – Prüfprotokoll: Adaptive Stage Transformation

## Erfolgreich geprüft

- `npm run test:v690`: **50 Prüfgruppen**, **15.000 deterministische Songpositionen** mit verschiedenen Genres, Gruppenstärken und Performance-Tiers. Abschnittsrollen, belegtes Finale, fließende Grenzen, Unterbrechungen, Pausen/Seek, Songwechsel, verifizierte V604-Daten, V622-Basisschutz, Lyrics-/Sängerschutz und manuelle Änderungen.
- `npm run test:v690:types`: **PASS**. Strenger isolierter TypeScript-Check des neuen Stage-Planners zusammen mit bestehenden Kernmodulen.
- `npm run test:quick`: **PASS**. Aktuelle Regressionen V669–V690 sowie Syntax, Architektur, Windows-/Linux-Modul-Casing, Schutz vor produktiver Testtyp-Einbindung und Spotify-/OAuth-Umgebungsprüfung.
- Historische Regressionen `test:v622`, `test:v635`, `test:v647`, `test:v689`, `test:v601`, `test:v555`, `test:v608`, `test:v621`, `test:v623` und `test:v640`: **PASS**. Bühnen-/Atmosphären-/Licht- und Performancebudgets sind weiterhin im alten Rahmen.
- Isolierte TypeScript-Prüfungen `test:v622:types`, `test:v635:types`, `test:v647:types`, `test:v689:types`: **PASS**.
- Der bestehende 2-Dreiecke-Hintergrundshader wurde nur um einen Uniformwert erweitert. Keine neue GLB-Bühne, zusätzliche Draw Calls, neuen Lampen, Materialien, neuen Timer oder Audioabfragen.

## Noch offen / Umgebungsgrenze

- `npm run check:dependencies`: **BLOCKIERT**, 17 npm-Abhängigkeiten nicht installiert und `package-lock.json` fehlt.
- `npm run build`: **BLOCKIERT** durch diesen vorgesehenen V680-Abhängigkeitscheck vor `tsc --noEmit` und `next build`. Kein erfolgreicher kompletter TypeScript- oder Next.js-Produktionsbuild in dieser Umgebung.
- Gesamte historische Release-Suite (`npm run check:release`) nicht vollständig ausgeführt.
- Keine tatsächliche visuelle Browser-/WebGL-Abnahme mit echten Avataren. Das Einhalten sämtlicher Lyrics-/Avatar-Schutzbereiche muss visuell geprüft werden.

## Abnahme auf Windows

```powershell
npm install
npm run test:v690
npm run test:v690:types
npm run test:quick
npm run build
```

Empfohlene manuelle Tests: ein voll synchronisierter Deutschrap-Titel mit Verse/Hook/Finale, ein Hardstyle-Build/Drop, ein nicht durchgehend bestätigter Song, drei und vier GLB-Tänzer, manuelle Stage-Looks sowie angepasste Beleuchtung, Pause/Seek/Blackout, Reduced Motion und Low-Tier. Prüfen: sanfte Perspektivöffnung ohne harte Schnitte, kein Überstrahlen der Lyrics, kein Versetzen/Neuladen von Avataren, keine Änderungen der bestehenden Light- und Gobo-Budgets.
