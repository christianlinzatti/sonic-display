# Sonic Display V581 – Coherent Deutschrap Facial Performance

Stand: 26.10.2026. Aufbauend auf dem bereitgestellten **V580-Projekt**, nicht auf einem neuen Beispielprojekt.

## Änderungen

- **Mund:** Bei **gültigen, dichten** Deutschrap-Wortmarken wird nur die *bestehende* Kiefer-Ansprache um maximal 10,5 % und die Release-Zeit vorhandener breiter/runder Morphs um maximal 5,5 % verändert. B/P/M-Verschlüsse, Morph-Zielwerte, Audio-Mundspur, V562-Kalibrierung und alle manuellen Lippenedits werden **nicht** überschrieben. Keine automatische Silben-/Phonem-Erkennung.
- **Mimik:** Brauen und Squint bekommen eine kleine, phasenbegrenzte Begleitbewegung, die mit der bestehenden V573-Mimik additiv kombiniert wird. Blink, Smile und Cheek bleiben im V581-Layer unverändert. Keine erratene Stimmung.
- **Kopf:** Vorhandene, eindeutig benannte GLB-Head-Bones erhalten maximal ca. 1,43° kurzen Wortakzent. Der Rig-Adapter entfernt nur *eigene* additive Winkel; wenn die GLB-Animationsmischung neue Werte geschrieben hat, werden diese nicht verändert. Ohne Head-Bone keine Kopfbewegung durch V581. Bereits vorhandene V564-Animationen laufen weiter.
- **Augen:** Miniatur-Deltas werden ausschließlich auf gültige V574-Szenen/Blick-Cues angewendet. Bei fehlendem Cue, falschem Track, fehlender Bestätigung, ungültigem Zeitbereich oder ohne Eye-Bones kein V581-Augen-Overlay.
- **Gesangssicherheit:** Bei mehreren Avataren sind nur trackgebundene V385-/V496-Sänger-Cues erlaubt. Manuelle Gesichtspose, manuelle Wörter, Audio-Lip-Sync und fehlende Zeitbeweise schalten V581 ab. `reducedMotion` und Low-Tier deaktivieren die neuen Akzente.
- **Performance:** Kein zusätzlicher `useFrame`, keine Netzwerkanfragen, GLB-Assets, Draw-Calls, Shader oder neuen Lichtquellen. Sampling nutzt nur die existierenden Lyrics-Wörter.

## Testbefehle

```bash
npm run test:v581
npm run test:v581:types
npm run test:smoke:v581
# Nach echtem npm install:
npm run typecheck
npm run build
```

## Noch zu prüfen

Die statischen/isolierten Tests prüfen Codepfade und reine mathematische Offsets, **keine** reale Audiolippe, kein WebGL-Film, keine echten GLB-Animationen und keine Raspberry-Pi-FPS. Für eine Freigabe auf dem Zielgerät benötigen wir A/B-Aufnahmen bei langen Deutschrap-Versen, bei Feature-Wechseln sowie unter 10-Zoll- und reduzierten Leistungsprofilen. Der V580-Hardwarebenchmark bleibt nutzbar.
