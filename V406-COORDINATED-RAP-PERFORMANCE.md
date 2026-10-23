# Sonic Display V406 – Coordinated Rap Performance

Basis: **V405 Rap Lip-Sync & Visual Articulation**, einschließlich der V404 QA und aller vorherigen Hotfixes.

## Neu

- Gemeinsame, rein synchrone **Word-Clock**: `rapStagePerformanceV406.ts` erhält das Ergebnis aus `resolveVocalPerformanceQualityV374` mit validierten V405-Wortmarken.
- **Gesicht**: diskrete Augenbrauen-, Wangen- und Squint-Akzente nach Vocal-Betonung. Kiefer, Lippenschluss, breite und runde Vokale bleiben unverändert. Der Morph-Overlay-Auftrag im `VocalRigV368` erhält bestehende Modellanimationen.
- **Körper**: sanfte zusätzliche Head-Nods, Kopfneigung, Schulter-/Arm-Akzente und Brustbewegung, gebunden an die vorhandenen `V371`/`V393` Körpercues. Die vorhandene Dämpfung erfolgt durch `applyVocalStageOverlayV371`.
- **Beide Avatar-Typen**: procedural und GLTF/R3F. Die prozeduralen Avatare erhalten zusätzlich sichtbare Augenbrauen und eine leichte Squint-Reaktion. Vorhandene Hand-/Partner-IK, Kamera und gespeicherte Choreografien bleiben erhalten.
- **Rollen-/Sicherheitsregeln**: Nicht singende Backing-Avatare werden nicht animiert. Bei Pause, reduziertem Bewegungsmodus, Zeilen- statt Wort-Timing, Instrumentalstellen, fehlenden Lyrics oder deaktiviertem Vocal-Sync wird kein neuer Akzent erzeugt. Authored-Choreografien haben Vorrang; optionale Gestensteuerung wird respektiert.
- Keine zusätzlichen Audiozugriffe, Timer, Bibliotheken oder Backend-Anfragen. Keine neuen Nutzereinstellungen; vorhandene Expressivität steuert die Stärke.

## Prüfung

`npm run test:v406` testet Pausen, Casting, sichere Bounds, Mimik/Kiefer-Trennung, Wort-Synchronität und konsistentes Seeking. `npm run build` startet vor dem eigentlichen Next.js-Build V406 und V404/V405-Tests. `npm run verify` führt weiterhin Offline-Regression, Quellprüfung, Typecheck und Build aus.

## Grenzen

Dies sind **text- und zeitbasierte visuelle Annäherungen** – keine Phonemerkennung, Stimmtrennung, emotionale KI-Erkennung oder tatsächliche Beat-Erkennung aus dem Song. Sichtbare Qualität und Performance müssen mit echten GLB-Modellen und Lyrics im Browser geprüft werden.
