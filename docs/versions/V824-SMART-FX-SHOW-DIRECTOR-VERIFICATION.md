# Sonic Display V824 — Smart FX Show Director

**Integrationsstand, nicht produktiv freigegeben.** Basis: vollständige Sonic Display V823.

## Neue Funktionen

- `components/visualizer/smartFxShowDirectorV824.ts`: reiner, deterministischer Auto-Regieplaner, der ausschließlich den bereits freigegebenen V604-/V761-Songakt verwendet.
- Musikalischer Spannungsbogen für Intro, Verse, Hook, Build, Drop, Break und Finale.
- Genres: Deutschrap, Hardtekk, Hardstyle, Deutschrock/NDH und Pop, mit stabiler variation pro Akt und Track.
- Modus Cinematic / Balanced / Festival, Aktivierung und Intensität über das Concert FX Studio.
- Schonung der bestehenden Lyrics-/Vocal-Fokusse und Ensembles. Qualität und Gerätegrenzen sind weiterhin durch die bisherigen Planer geschützt.
- Bereits gerenderte Laser, LED-Muster, Partikel, Schaumkanone und V819-Szenenwechsel werden mit relativen Gains (0,30 bis 1,20) moduliert; keine neuen Shader, Renderflächen oder Lichter.
- Die **manuelle V823-Timeline gewinnt spurweise** über automatische Regie. Explizite V821-LED-Muster behalten Vorrang. V791 entscheidet weiterhin, ob und wann Szenenwechsel existieren.
- Alle Einstellungen bleiben im bisherigen `concertFxV810`-Speicher-/Exportpfad; alte Werte werden auf die neuen Defaults normalisiert.

## Bestandene Prüfungen

- `npm run test:v824`: 46 Testgruppen, darunter Beat-/Abschnitt-Sicherheit, Seeks, Genre-Regie, Intensitätsgrenzen, manuelle Cues, LED-Look-Priorität und Bühnenintegration.
- `npm run test:v824:types`: isolierter TypeScript-Check für V824 und seine Kernabhängigkeiten bestanden.
- `npm run test:v823` bis `npm run test:v815`: bestanden.
- `npm run test:v814` bis `npm run test:v800`: bestanden. Bei V800–V808 wurden nur feste Paketversionsregexe auf V824 erweitert. V823 erhielt eine Integrationserwartung für die nun zuständige LED-Look-Merge-Funktion, da manuelle Cues weiterhin Priorität besitzen.
- `npm run check:syntax`: 1187 TS/TSX-Dateien erfolgreich geprüft.
- `npm run check:architecture`: Architekturstand V824, 897 Referenzen, 10 Bereiche.
- Isolierte TypeScript-Checks `test:v823:types` bis `test:v816:types` sind abgeschlossen; der noch folgende V815-Befehl erschien im Log, aber die Shell-Gesamtausführung erreichte ihr Zeitlimit, daher wird **V815 isolated typecheck nicht als abgeschlossen bestätigt**.
- Keine Windows-/Linux-Kollisionspaare bei `.ts`/`.tsx`. `package.json` und `package-lock.json` stehen konsistent auf `0.1.0-v824`.

## Noch offen / nicht freigegeben

- `npm run typecheck`: hat in der Ausführungsumgebung das Zeitlimit überschritten; Ergebnis **nicht bekannt**.
- `npm run build --ignore-scripts`: `next: not found` (kein installiertes `node_modules/next`). Kein bestätigter Next.js-Produktionsbuild.
- Echte 3D-/WebGL-/GPU-Abnahme für mehrstündige Sessions, 4 Performer, Lyrics, Laser und die Schaumkanone; noch nicht ausgeführt.

## Lokal vor Freigabe

```powershell
npm ci
npm run typecheck
npm run build
```

Anschließend praktische Szene-Tests: mit/ohne bestätigte Songabschnitte, manuellen V823-Mute-/Boost-Cues, festen LED-Mustern, Pause, Blackout, reduzierter Bewegung, Low-Tier und Kamera-/Vocal-Fokus. Verifiziere Partikel-, Schaum- und Lasergrenzen unter echter GPU-Last.
