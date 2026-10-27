# Sonic Display V505 – Prüfbericht (24.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v505`: 26.000 deterministische Playback-Frames mit 77.999 Actor-Samples. Geprüft: 2–4 Avatare, Solo/Reply/Duett/Hook, unmittelbare Bühnenabstände, Gaze nach realen Positionen, eng beieinanderliegende Avatare, vertikale Staffelung, ruhige Gesten, Quality-Tiers, Track-Wechsel, manuelle Priorität, Pause, Reduced Motion, Immutabilität und endliche Werte.
- `npm run test:v505:types`: isolierter TypeScript-Check des V505-Kerns bestanden.
- **Alle 55 Versions-Regressionen V451–V505 bestanden**, nacheinander in Blöcken V451–V475 und V476–V505 geprüft. V500–V505-Kern-Typechecks ebenfalls bestanden.
- `npm run check:syntax`: 699 TS-/TSX-Quelldateien erfolgreich geprüft.
- `npm run check:architecture`: aktuelle V505-Systemarchitektur, 164 Code-Referenzen und zehn Dokumentationsabschnitte verifiziert.
- Sicherheitsfreigabe: Die reine V505-Regie erzeugt keine Render-Schleife. Räumliche automatische Korrekturen werden ausschließlich über den vorhandenen V494-Fußkontakt-Guard und den V326-Gruppen-Rootpfad vorgenommen, nie bei Duo-/manuellen Bühnen. Keine Clip-, Bone-, Mund-, IK- oder Handkontakt-Mutation.

## Vorsicht bei Interpretation

Das Feature reduziert kleine Überlappungen und unnatürliche Winkel. Es garantiert **keine kollisionsfreie** Bühne: Die bestehenden Gruppenspuren und reale Avatar-Mesh-Größen bestimmen weiterhin die Grundaufteilung; der V505-Korrekturweg ist bewusst klein und ist bei gesperrtem Fußkontakt deaktiviert.

## Nicht verifiziert

`node scripts/build-preflight.cjs` meldet nur **1 von 17 direkten npm-Abhängigkeiten** im lokalen Arbeitsverzeichnis. Next.js, React, Three.js und zugehörige Typen sind nicht installiert. Ein vollständiger `npm run build`, eine visuelle GLB-Vorschau und die echte Raspberry-Pi-FPS-/Kontaktmessung wurden daher hier nicht durchgeführt.

Auf dem Entwicklerrechner im ausgepackten Projekt: `npm install` und `npm run build` ausführen und die visuellen Szenen prüfen.
