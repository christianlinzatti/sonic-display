# Sonic Display V205 – Expressive Dance Characters 2.0

## Funktionen
- Opt-in pro Charakter im Character & Motion Library Panel, standardmäßig ausgeschaltet.
- Automatische und manuelle Charakter-Stile: Hardtekk/Hardstyle (hard), Techno/Flow (fluid), Playful, Subtle.
- Musiksignalabhängige Zusatzbewegungen an Kopf, Schultern und Oberkörper; sanfte Rotationsoffsets werden über den bestehenden Rig Controller eingemischt.
- Reaktion auf BPM, Bass, Beat-Stärke, Energie und Songabschnitt; bei Pause und reduzierter Bewegung ist der zusätzliche Cue null.
- Lokale Speicherung pro Avatar mit sanitisierten Werten und Event zur Aktualisierung ohne Seitenreload.

## Grenzen
Keine neuen GLB-Motion-Frames, kein KI-Inferenzmodell und keine Morph-Target-basierte Gesichtsanimation. Die vorhandene Rig-Automatik stellt nur Bewegungen bereit, deren Knochen am GLB-Avatar erkannt werden. Ausdrucks-Cues bleiben begrenzt und beeinflussen nicht die Foot-IK-Bodenanker. Die Funktion erzeugt kleine Zusatzbewegungen, keine eigenständigen choreografierten Tanzschritte.

## Tests
`npm run test:expressive-v205`; `npm run check:syntax`. Ein vollständiger Next.js-Build benötigt installierte npm-Pakete.
