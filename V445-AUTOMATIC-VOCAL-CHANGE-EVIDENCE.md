# Sonic Display V445 – Automatic Vocal Change Evidence (vorsichtige Sprecherwechsel-Hinweise)

Diese Version ergänzt V444 um eine **lokale, lyrics-synchronisierte Analyse von möglichen Klang-/Sprecherwechseln** auf der Feature-Duo- und der automatischen Gruppenbühne mit drei oder vier Avataren. Sie ist bewusst **keine fertige Multi-Speaker-Diarisierung**: Die existierende Audio-Pipeline stellt nur aggregierte Mikrofon-Merkmale (Bass-, Mitten-, Höhenanteil und Lautstärke) bereit. Sie verfügt über keine von der Begleitung getrennte Stimme, keine Sprecher-Embeddings und keine verlässliche Sänger-Identität. Ein auffälliger Frequenzwechsel kann genauso von Instrumenten, EQ oder Effekten stammen. Deshalb heißt jedes Ereignis ausdrücklich `possible-voice-or-mix-change` und hat höchstens 45 % heuristische Sicherheit.

## Funktion und Verankerung

1. `vocalChangeEvidenceV445.ts`: deterministischer, begrenzter Live-Analysator. Nur bei **aktivem** Mikrofon, laufender Wiedergabe, synchronisierten Lyrics und gültiger Lyrics-Zeile. Tastet höchstens ungefähr alle 160 ms ab, ignoriert Stille/ungültige Werte und vergleicht über mindestens fünf Audiosamples gemittelte normalisierte 3-Band-Signaturen **an Zeilengrenzen**. Unauffällige Änderungen lösen nichts aus; Kandidaten haben mindestens 6,5 Sekunden Abstand. Trackwechsel und Zurückspringen setzen den Zustand zurück. Bis zu 5.000 Lyrics-Zeilen werden unterstützt, Lookup mittels binärer Suche.
2. `ThreeAvatar.tsx`: pro Feature-Duo bzw. automatischer V442-Gruppenbühne ein flüchtiger Ref mit der letzten Spektralsignatur. Das Ergebnis wird als kurzer, **anonymer** Musikreaktionsimpuls in die bestehenden `PartnerLookContext`-/`PartnerGestureContext`-Overlays aus V444 eingespeist. **Kein neuer Künstler-/Vocal-Slot**, keine Änderung an Mundbewegung oder Kamerafokus.
3. `multiArtistInteractionV444.ts`: akzeptiert optional den durch V445 begrenzten Impuls. Nur visuell zuhörende Avatare dürfen kurz stärker reagieren; manuelle V385-/V416-Gesangsrollen ignorieren ihn vollständig.
4. Im vorhandenen Rap Performance Editor → Automatic Motion Intelligence → **V445** sind der Schalter (Standard an) und eine Empfindlichkeit (Standard 60 %) verfügbar. Ein **Live-Hinweis mit Songsekunde und begrenzter Anhaltspunkt-Sicherheit** wird über ein Browser-Ereignis aus Metadaten angezeigt – ohne Audiodaten oder Lyrics-Text zu übertragen.

## Voraussetzungen / Vorrang

- Die vorhandene **Mikrofon-Funktion muss eingeschaltet und tatsächlich aktiv** sein, und es müssen synchronisierte Lyrics existieren. Ist nur die Spotify-Beat-Schätzung vorhanden oder der Mikrofonzugriff gesperrt, **gibt es keine Audio-Kandidaten**.
- Das automatische V440-Feature-Duo (mit aktiven Künstlerlabels) oder die V442-Gruppe mit 3–4 Avataren kann eine dezente neutrale Reaktion zeigen. Eigene Duett-Choreografien, Gruppenformationen, Solo und Reduced Motion bleiben unverändert.
- **Manuell angelegte Vocal-Zuordnungen in V385/V416, eigene GLB-Choreografien, Lip-Sync-Dokumente, Kamera-Keyframes und Künstlernamen bleiben unverändert.** Bei manuell geregelten Vocal-Rollen erfolgt kein Kandidaten-bedingter Rollenwechsel.
- Keine Audiodateien, kein Persistieren oder Hochladen von Mikrofon-Samples, kein Netzwerkzugriff und kein automatisches Ermitteln oder Zuweisen realer Künstlerstimmen. Reine Spektrum-Zusammenfassungen bleiben nur im Arbeitsspeicher bis Trackwechsel. Das Browser-Ereignis enthält nur Track-ID, Zeitpunkt und niedrigen heuristischen Wert.

## Technische Grenzen

Eine **echte akustische Speaker-Diarisierung und Identifizierung von Sängern** benötigt deutlich mehr als die drei Energiebänder der Browser-Mikrofonanalyse: Zugriff auf geeignetes Audiosignal, Trennung von Vocal-/Instrumentalanteilen, Sprecher-Features sowie Übereinstimmung zwischen Aufnahme, Lyrics und Künstler-Credits. V445 stellt diese Daten nicht bereit und gibt deshalb keine scheinbar präzisen Sprecherzuordnungen aus. Die Kandidaten dienen vorerst nur als vorsichtige Bühnen-Hinweise.

## Prüfkommandos

```powershell
npm install
npm run verify:v445
npm run typecheck
npm run build
```

Details der ausgeführten/offenen Checks in `V445-VERIFICATION.md`.
