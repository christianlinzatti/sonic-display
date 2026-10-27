# Sonic Display V597 – Advanced Deutschrap Lip-Sync 6.0

## Ziel

Dezent flüssigere Artikulation bei schnellen Deutschrap-Worten und verständlichere Pausen, **ohne** behauptete automatische Erkennung von Phonemen, einzelnen Silben oder Künstlerstimmen.

## Umsetzung

1. `advancedDeutschrapLipFlowV597.ts` nutzt ausschließlich die vorhandene `rapLipWordAtV415`-Marke für das **aktive, geprüfte Wort** und dessen tatsächlich bekannten Abstand zum Folgewort. Verbundene, kurze Worte erhalten gegen Wortende eine minimale Vokalform-Anpassung (maximal 2,6 % Blend bei voller Intensität) zur folgenden **geschriebenen** Vokalform. Kein früher Start, keine Überbrückung von Pausen, kein direktes Ableiten individueller Phonemzeitpunkte.
2. Am **belegten** Phrasenende wird ein bereits geöffneter Kiefer um maximal 1,8 % reduziert; ohne gültige explizite Wortende-Zeit erfolgt keine Phrasenverfeinerung. Vorhandene B/P/M-Siegel sind unangetastet, auch wenn das folgende Wort mit B, P oder M beginnt.
3. Die vorhandene exponentielle Kiefer-/Vokal-Glättung wird geringfügig modifiziert (max. +7,5 % Kieferattacke, max. −3,5 % Vokalattacke). Kein zusätzlicher Timer, Renderloop, GLB-Mixer oder GPU-Aufwand. Die eigentliche Morph-Ansteuerung bleibt in der `VocalRigV368.tsx`.
4. Gleiche geschützte Wortverfeinerung im prozeduralen `ProceduralDancerAvatarV492.tsx`. V546-Verfeinerung wird vor V597 ausgewertet; V572/V581-Cadence-Smoothing bleibt erhalten. Andere Gesichts- und Körperkanäle sind unverändert.
5. Harte Schutzregeln: keine Aktion bei Pause, fehlenden Wort-Timestamps, falschem aktivem Wort, nicht zugeordnetem Duett-Slot, manuell priorisierter Animation, V420-Edits, V423-Audio-Munddaten, Reduced Motion, Low-Pi-Tier oder fehlender Rap-/Sync-Bestätigung.

## Lokal prüfen

```bash
npm run test:v597
npm run test:v597:types
npm run test:smoke:v597
npm run verify:v597
```

Eine echte Gegenüberstellung mit demselben GLB-Rig und demselben Deutschrap-Track sollte danach im V592-Live-Runner aufgenommen und mit V594/V595 vor/nach dem Release gesichtet werden. Ohne externe Sprach-/Phonemalignment-Daten sind Silbengrenzen nicht authentisch rekonstruierbar.
