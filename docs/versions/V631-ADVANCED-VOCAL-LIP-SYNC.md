# V631 – Advanced Vocal Lip-Sync

## Ziel

Die schon vorhandene Deutschrap-Lippenpipeline reagiert in besonders schnellen Wortfolgen zuweilen zu abrupt auf starke Zielwertwechsel. V631 verbessert deren zeitliche **Kontinuität**, ohne nicht vorhandene per-Phonem-Timestamps zu behaupten oder bestehende Datenquellen zu ersetzen.

## Implementiert

- Neue reine Funktion `planAdvancedVocalLipSyncV631`: nur aktive, wortgenau synchronisierte, schnelle Rap-Passagen mit einem bestätigten Sänger. Die tatsächlichen Wortgrenzen kommen aus dem bisherigen V415-Index; es wird kein Stimmsignal oder Phonem aus Lyrics geraten.
- `connected-flow`: geringfügig schnellere Jaw-/Wide-/Round-Antwort bei kleinen Differenzen vorhandener Zielwerte (nie neue Mouth-Targets). `phrase-settle`: vorsichtigere Release-Bewegung am Ende einer tatsächlich beobachteten Wortgruppe.
- Wortgrenzen werden anhand ihrer echten Zeitlage mit einem kurzen glatten Signal-Envelope behandelt. Bei **großen vorhandenen Differenzen** zwischen gerendertem Morph und Ziel dämpft die bestehende Zielwertinterpolation in deren unmittelbarer Nähe etwas, um sichtbare Sprünge zu reduzieren.
- Multiplikator begrenzt auf **0,85–1,15**. Keine Änderung der Daten `jaw`, `wide`, `round` selbst, sondern nur der Rate in der existierenden Animationsschleife.
- Der echte GLB-Avatar `VocalRigV368.tsx` und der prozedurale Fallback `ProceduralDancerAvatarV492.tsx` wenden **dieselbe** Policy an ihren bereits verwendeten Morph-/Skalen-Updates an. Kein zweites Facial Rig und keine neue Animation.

## Sicherheitsgrenzen

- `lipsClosed` (B/P/M-Siegel), `blink`, Blick, Brauen, Wangen und andere Ausdruckskanäle bleiben unangetastet.
- Anfangsbuchstaben B/P/M, unmittelbar folgende B/P/M-Wörter, hohe Lippenschlusswerte, V420-Edits und nachgewiesene V423-Audio-Mundspur sperren V631.
- Bei manuell ausgewählter Choreografie, nicht bestätigtem Sänger, pausiertem oder unsynchronisiertem Song, falschem Wort, falschen/ungültigen Zeitwerten, Reduced Motion oder Low-Tier bleibt der Multiplikator exakt `1`.
- Die V562-Kalibrierung und finale B/P/M-Kontaktbegrenzung greifen **nach** der V631-Geschwindigkeitsanpassung.
- Keine neuen WebGL-Ressourcen, GLB-Clips, Netzwerkschnittstellen, AnimationMixer, Frame-Loops oder persistenten Zustände.

## Was es nicht ist

Keine Tonspur-Trennung, Phonem-Erkennung oder neue Silben-Timestamps. Wortzeitstempel allein können echte Lippenlaut-Übergänge nicht verifizieren. „Natürlichere Lippen“ bleibt eine visuelle Hypothese; reale Audio-/GLB-Vergleiche inklusive 2–4 Performer müssen stattfinden. Ziel ist ein sinnvoll begrenzter Feinschliff, kein Ersatz für ein späteres vokalbasiertes Alignment.

## Windows

```powershell
npm install
npm run test:smoke:v631
npm run verify:v631
npx tsc --noEmit
npm run build
```
