# Sonic Display V407 – Rhythm-Aware Rap Performance

Basis: **V406 Coordinated Rap Performance** einschließlich V405 Rap-Artikulation und V404-Qualitätssicherung.

## Neue Gestenlogik

Die neue reine TypeScript-Komponente `components/visualizer/rapRhythmPerformanceV407.ts` ergänzt die vorhandene V406-Körperanimation. Beide Avatar-Pipelines (prozedurale und GLTF-/R3F-Modelle) verwenden dieselbe Berechnung:

- **Kick / Bassdrum** aus der bestehenden Mikrofonanalyse: kurzer, dezenter Brust-/Oberkörper-Akzent.
- **Snare / Backbeat** aus spektralem Snare-Wert und Transienten-Hüllkurve: leichter Kopf-Nick und optional ein kleiner Schulter-/Arm-Akzent. Dies ist eine Audioheuristik, keine sichere Schlagzeug-Trennung.
- **Verse**: kleinere, wortzentrierte Handgesten, stärkerer Fokus auf rhythmisches Kopfnicken.
- **Hook**: offenere Armgesten und stärkere Betonung der bereits erkannten Lyrics-Wörter; Build und Drop sind gedämpft, Breaks bleiben ruhig.
- **Rollen und Sicherheit**: nur aktive, per V405 bestätigte Rap-Wörter mit einer erlaubten Sängerrolle werden zusätzlich betont. Bei pausierter Wiedergabe, reduzierter Bewegung, deaktivierter Vocal-/Groove-/Körperanimation oder manuell priorisierten Choreografien bleibt die zusätzliche Ebene inaktiv. Die vorhandenen Gesteneinstellungen und Rap-Groove-Regler steuern die Stärke.

## Datenquellen und Grenzen

**Echte Kick-/Snare-Akzente** werden nur genutzt, wenn die bestehenden Audiofeatures eine Messung durch die Mikrofon-Pipeline plausibel kennzeichnen (`bpmConfidence` bzw. `phaseLocked`). Für Kick wird der Mikrofon-Onset-Indikator `kickAccentIntensity`, für Snare ein Spektral-/Attack-Heuristikwert verwendet. Ohne verlässliche Messwerte bleiben die zusätzlichen Drumeffekte **aus**. Ein Spotify-geschätzter Beat oder einfaches BPM-Raten wird **nicht** als echtes Signal ausgegeben. Die gesonderte, wortbasierte Verse-/Hook-Betonung bleibt dann möglich.

Keine neue Audio-Aufnahme, kein externer Dienst und keine KI-Phonem-/Vokalerkennung. Die Lyrics kommen aus der vorhandenen Synchronisationslogik; die Stimmung eines Liedes wird nicht aus der Stimme erkannt. Gespeicherte Choreografien, Blickrichtung, Partner-IK und Mundformen bleiben vorrangig. Das V371-Overlay glättet Bewegungen und gibt sie bei Pausen wieder frei.

## Test und Integration

- `npm run test:v407`: verifiziert getrennte Kick-/Snare-Reaktionen, Verse/Hook, Audio-Provenienz, deaktivierte Zustände, seek-sichere deterministische Berechnung, Sängerrollen, sichere Gelenkgrenzen und beide 3D-Avatar-Renderer.
- `npm run verify:offline:fast`: Gesamtsuite der historischen isolierten Tests.
- `npm run verify`: Offline-Suite, Preflight, TypeScript und Produktions-Build.
- `npm run build`: Next.js-Build; `npm run build:preflight` prüft V407 und die bestehenden sicherheitskritischen Fälle separat. Unter Windows zuerst `npm install` ausführen.

## Sichtprüfung empfohlen

Mit aktivierter Mikrofonanalyse und gut synchronisierten Deutschrap-Wortzeitmarken einen Verse-/Hook-Wechsel ansehen. Für Spotify-only kann die Anzeige ohne Mikrofon bewusst zurückhaltender sein. Animierte GLB-Modelle reagieren je nach verfügbaren Rig-Knochen unterschiedlich; mit realen Modellen müssen eventuelle Kollisionen von Zusatzgesten und importierten Motion-Clips weiterhin manuell geprüft werden.
