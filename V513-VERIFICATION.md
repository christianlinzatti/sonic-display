# V513 – Verifikation (24.10.2026)

## Erfolgreiche Prüfungen

- `npm run test:v513`: **PASS**, 26.000 deterministische Bühnenzustände (2–4 Tänzer), 3D-Platzierung, Rückfall bei nicht untersuchten Paaren, Teilabdeckung, Kapselrisiko, Pi-Sparprofil, Installations-/Clip-Auswahl und UI-Verbindung.
- `npm run test:v513:types`: **PASS** (isolierte Kernmodule; kein JSX-App-Typecheck).
- `npm run test:v512`: **PASS**, 36.000 historische Visual-Concert-Studio-Simulationen.
- **63 Versionsregressionen V451–V513:** **PASS**, sämtliche Tests einzeln ausgeführt (Blöcke V451–V475, V476–V498, V499–V512 und V513).
- **22 isolierte TypeScript-Kernprüfungen V492–V513:** **PASS**.
- `npm run test:gltf-hook-split`: **PASS**.
- `npm run test:three-avatar-split`: **PASS**.
- `npm run check:syntax`: **PASS**, 716 TS/TSX-Quelldateien / Import-Bindings.
- `npm run check:architecture`: **PASS**, 186 aktuelle Quellverweise und zehn Architekturabschnitte.
- Vollständigkeit: keine Datei aus dem veröffentlichten V512-Archiv fehlt in V513.
- Archiv-CRC-Prüfung und SHA-256-Prüfsumme erfolgen nach ZIP-Erstellung.

## Qualitätsgrenzen

1. Das Studio verwendet originale GLB-Modelle in **geklonten Vorschau-Szenen**. Es visualisiert dort die *neu* animierten V508-Oberkörper- und Armkapseln. Es gibt **keinen** verlässlichen synchronen Mitschnitt sämtlicher Animationen aus dem Live-Visualizer. V512-Live-Daten liefern nur Bühnen-Roottimestamps/Positionen; ein Demo-Szenario bleibt Demo.
2. Kapseln approximieren Körperabschnitte. Keine exakte Skinned-Mesh-, Finger-, Kleidungs- oder Objekt-Kollisionserkennung. Unbekannte, fehlende oder zu alte Skelette dürfen nicht als kollisionsfrei ausgewiesen werden.
3. Der zweite WebGL-Canvas existiert ausschließlich während der explizit geöffneten Vorschau. Die optionalen Kapselproben erfolgen mit maximal acht Hz (Pi Eco zwei Hz; Low keine). Animationen/Renderer können beim aktiven Anzeigen dennoch merkliche GPU-Last erzeugen; keine tatsächlichen Pi-FPS-Benchmarks wurden ermittelt.
4. Hier fehlen 16 von 17 direkten npm-Abhängigkeiten (u.a. Next.js, React und Three.js) und ein package-lock.json. Deshalb wurden **weder** ein vollständiger `npm run build` / App-Typecheck **noch** ein realer WebGL-/Motion-Integrationstest durchgeführt. Lokal im ausgepackten Projekt `npm install` und `npm run build`, anschließend GLBs in Solo-/Duett-/Viererbesetzung prüfen.
