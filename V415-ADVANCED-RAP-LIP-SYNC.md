# Sonic Display V415 – Advanced Rap Lip-Sync

## Ziel

V415 erweitert **bestehende** V367/V372/V374/V384/V405-Mundsteuerung für schnellen Deutschrap. Es ist keine neue Audio- oder Spracherkennung: Die Verbesserungen sind **textbasierte Näherungen**, die ausschließlich bei bestätigten Wortzeitstempeln greifen.

## Neu

1. **Opt-in-Gesichtslayer:** `avatarRapLipEnabledV415` ist standardmäßig **false**. Deaktiviert bleibt das V414-Gesicht unverändert.
2. **Geschätzter B/P/M-Lippenverschluss** unmittelbar am Anfang eines bestätigten Wortes, mit weichem Abklingen; Kieferbewegung wird bei geschlossenen Lippen begrenzt. Dies ist **kein Phonem-Timestamp**.
3. **Schwache Koartikulation** zwischen unmittelbar benachbarten schnell gesprochenen Wörtern (maximal 70 ms Lücke). Kein Überblenden bei Pausen und kein Überspringen von B/P/M-Anlauten.
4. **Mundgetrennter Offset** (`avatarRapLipOffsetMsV415`, −150 bis +150 ms). Er verschiebt ausschließlich die berechnete Gesichts-Mundpose; der V372-Songtakt, Körpergesten, Sängerzuordnung, Musik-Timeline und angezeigte Lyrics-Zeit bleiben unverändert. Beim Wert 0 findet kein zusätzlicher Sampling-Aufruf statt.
5. **Intensitätsregler** 0–100 %, der nur V415 betrifft. Bei 0 wird auch der zusätzliche Mundversatz deaktiviert.
6. **Vocal Sync Inspector:** Kennzeichnung der Datenbasis, des geschätzten Verschlusses, der schnellen Wortfolge, Mundzeit und numerische Anzeigen für Kiefer, breite/runde Lippenform und Verschluss. In der Vorschau ändert das Verschieben der Zeit **nicht** die Spotify-Wiedergabe.

## Bedienung

Unter **Einstellungen → Anzeige → V415 · Advanced Rap Lip-Sync** die Option aktivieren, Präzision einstellen und den Mundversatz feinregeln. Daneben steht die bereits vorhandene V372-Kalibrierung zur Verfügung, die **Kopf, Körper und Mund gemeinsam** verschiebt; sie ist nicht mit dem V415-Mundversatz zu verwechseln. Der **Vocal Sync Inspector** zeigt die Kanäle und erlaubt den Vergleich mit der ausgeschalteten V415-Option, auch mit den klar gekennzeichneten Test-Lyrics.

Die eigentliche Wirkung sieht man mit einem Avatar, dessen Mund-Bones oder Morph-Targets steuerbar sind. Ein Rig ohne Mundsteuerung kann nicht durch den Timeline-Algorithmus repariert werden.

## Begrenzungen und Sicherheit

- Kein akustisches Transkript, keine gemessenen Silben- oder Phonemgrenzen, keine tatsächliche Identifikation des Sängers.
- Synchronisierte **Wortzeitstempel** erforderlich. Nur Zeilen-Timestamps, unsynced Lyrics, ungültige Lücken und Instrumentalpassagen erzeugen **keine V415-Mundakzente**.
- Pause und Reduced Motion lassen den zusätzlichen Layer aus. V385-Sängerrollen schalten weiter die Lippen nicht singender Avatare stumm.
- Keine Änderungen an gespeicherten V412-Presets, V413-Lyrics-Tanzsteuerung, V414-Gesten-Cues oder manuell gesetzten Choreografien.
- Zeit- und Intensitätswerte werden begrenzt. Keine selbst laufenden Timer, deterministische Berechnung beim Seek.

## Qualitätssicherung

`npm run test:v415` testet Validierung, Schätzung und Begrenzungen, Null-Aktivität bei Instrumental und Zeilen-Sync, verschiedene Sprecherrollen, abweichenden Mundtakt, deterministische Seeks und UI-/Live-Wiring. `tsc -p tests/tsconfig.v415-core.json` prüft die isolierte Kern- und Vocal-Engine unter TypeScript strict. Auf einem Rechner mit vollständigen npm-Abhängigkeiten zusätzlich `npx tsc --noEmit` und `npm run build` durchführen.
