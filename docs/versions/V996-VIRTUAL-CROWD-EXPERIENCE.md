# Sonic Display V996 – Virtual Crowd Experience

## Umfang
Opt-in-Publikumswellen, dezente auf gemessenen Kick reagierende Akzente und
maximal 24 instanzierte virtuelle Lichtstäbe. Szene nur aus V604-geprüftem
Song-Storyboard; keine automatisch erzeugten Songzeitpunkte.

## Reihenfolge
V815 → V825 → V874–V880 → V893 → V973 → **V996**.

## Sicherheitsregeln
- Standard deaktiviert, nur laufender autorisierter Song, identische Track-ID/Dauer.
- Keine Bühne beim Seek, Blackout, Lyrics-Fokus, manuellem Kamera-/Licht-/FX-Cue,
  reduzierter Bewegung oder Low-Tier-Grafik beeinflussen.
- Bassakzente nur bei gemessener Kick-Intensität >=0.35.
- Keine Verbindung zu Govee, Alexa, Mikrofon, API oder Browser-Timern.
- Maximal ein neuer Draw Call, 24 instanzierte Stäbe; keine Schatten/Lichtquellen.
- Opazität <=0.32; Publikumsbewegung klein und ohne Vollbildblitze.

## Validierung
`npm run test:v996` führt 13 Testgruppen einschließlich 10.000 Zuständen aus.
`npm run test:v996:types` prüft den Kern und die Produktionsanbindung mit
installierten Abhängigkeiten. CI: `npm run build:vercel` auf Node 24.
