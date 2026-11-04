# Sonic Display V405 – Deutschrap Lip-Sync & Visual Articulation

Basis: **Sonic Display V404 – Production Stability & Quality Assurance**. V404-Regressionstests und die zuvor behobenen Windows-, CSS- und Kamera-Hotfixes bleiben erhalten.

## Funktionen

- **Erweiterte Mundformen für Deutschrap**: Textbasierte Approximationen für F/V/W am Wortanfang, S/Z/ß und "sch" sowie rundere O/U/Ö/Ü- und breitere E/I/Ä-Vokale. Die bestehende B/P/M-Lippenschluss-Regel aus V384 hat weiterhin Vorrang.
- **Exakte Grenzen vorhandener Lyrics-Wortmarken**: V405 nutzt ausschließlich bereits synchronisierte, gültige Wortintervalle der Lyrics und die bestehende Playback-/Offset-Zeit. Bei Zeilen-Timing allein, unsynchronisierten Lyrics, Pausen oder Instrumentalteilen werden keine neuen Mundformen erzeugt.
- **Word-boundary smoothing**: Die V374-Kieferglättung übernimmt keine Mundwerte mehr von *einem anderen Wort*. Das reduziert das Verschmieren bei raschen Rap-Wortwechseln.
- **Sänger-/Avatar-Rollen** bleiben wirksam: Manuell als nicht singend markierte Avatare bleiben stumm; die neue Artikulationsschicht wird vor der bestehenden Rollen-Dämpfung aufgerufen.
- **Lip-Sync-Inspector**: Der bestehende V373-Inspector zeigt bei Wort-Timing die V405-Artikulationsklasse samt visualisierter Intensität an. Die Angabe ist als **geschätzte Mundform**, nicht als erkannter Laut gekennzeichnet.
- **Schonendes Echtzeitverhalten**: Wortmarken pro Lyrics-Zeile werden per WeakMap zwischengespeichert. Kein neuer Timer, kein Audio-Stream und kein Netzwerkanruf. Die Ausgabe hängt ausschließlich von Lyrics, Zeit und Einstellungen ab.

### Konfiguration

V405 baut auf dem bisherigen **Natürlichere Artikulation (V384)**-Schalter auf und ist bei Rap automatisch aktiv, wenn die V384-Option aktiv ist und ein präziser Wortzeitstempel vorliegt. Für Entwickler gibt es zwei optionale Einstellungen im `VocalQualityOptionsV374`-API:

| Option | Standard | Wirkung |
|---|---:|---|
| `rapArticulationEnabledV405` | `true` | V405-Finetuning aktiv / aus |
| `rapClarityV405` | `65` | 0–100 % Stärke; 0 schaltet es ab |

Es wird **kein neuer UI-Regler** eingeführt. Bestehende Nutzereinstellungen und gespeicherte Presets bleiben kompatibel. Außerhalb von Rap bleibt das V404-Verhalten unverändert.

## Qualitätssicherung

- `npm run test:v405` – gezielter Test: Wortanfänge, Wortenden, Sibilanten, Rund-/Breitvokale, Stille, fehlende Wortmarken, Pausen, ungültige Werte, Sängerrollen, Bewegungseinschränkungen und deterministische Seek-Wiedergabe.
- `npm run test:quality:smoke` – die Tests für Kamera, Lyrics, Lip-Sync aus V404 **plus** V405.
- `npm run build` – `test:v405` läuft **vor** `next build`.
- `npm run verify` – bestehende komplette Offline-Regressionssuite, Preflight, Typecheck und Next.js-Build.
- GitHub Actions führt `npm run verify` unter Windows und Ubuntu aus.

## Grenzen

Diese Effekte werden allein aus Text und Wortzeitstempeln abgeleitet. Sie sind **keine Spracherkennung, keine echte Phonem- oder Forced-Alignment-Analyse und keine Behauptung über die Stimme/Sängeridentität**. Fehlen Wortmarken, bleibt die V405-Schicht inaktiv. Unit-Tests prüfen keine gerenderte 3D-Gesichtsoptik, browserseitige Spotify-Antworten oder reale GPU-Performance. Für die vollständige Integrationsprüfung auf Windows: `npm install && npm run verify`.
