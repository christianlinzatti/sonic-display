# Sonic Display V962 – Intelligent Concert Narrative

## Ziel

Eine ruhige, genreangepasste Dramaturgie über den vollständigen Song hinweg. V962 arbeitet in der bereits existierenden automatischen V909-Govee-Sende-Schleife und benötigt **keine zusätzlichen Netzwerkaufrufe, Timer, Mikrofonzugriffe oder 3D-Objekte**.

## Funktionen

- Verse: zurückhaltend, bei Deutschrap etwas präsenter.
- Hook: mehr Licht, ohne den von V915/V961 begrenzten Helligkeitswert zu überschreiten.
- Build: sanfte, monotone Steigerung zur Drop-Phase; für Hardtekk/Hardstyle angepasst.
- Drop: volle bereits erlaubte Lichtwirkung, keine zusätzlichen Strobe-/Power-Kommandos.
- Break/Outro: kontrollierte Absenkung und reduzierte virtuelle FX.
- Bestätigte Phasenwechsel werden mit der vorherigen tatsächlich verifizierten V318-Phase interpoliert; keine erfundenen Abschnitte.

## Sicherheitsregeln

- Standardmäßig **deaktiviert**, einschaltbar im V958 Concert Studio.
- Nur mit `enabled`, `hardwareSync`, Wiedergabe und verifiziertem V318-Abschnitt.
- V912 gespeicherte Shows, V354 manuelle Bühnen- und Kamera-Cues, Wiederverbindung sowie nicht verifizierte Phasen behalten Vorrang.
- Intensitätskurven und Helligkeitswerte überschreiten nie den bestehenden Plan; V961-Governor ist weiterhin am Ende des Sendewegs aktiv.
- Keine Mutation von bestehenden Presets und keine Änderung des bestehenden LocalStorage-Schlüssels `sonic-display:ultimate-concert-v958`.

## Tests

`node tests/v962-concert-narrative-regression.cjs` umfasst Sicherheitsgates, Langzeit-Szenarien, Grenzwerte, deterministische Ausgabe und Quell-Integration. `npm run test:v962:types` prüft das TypeScript-Modul isoliert. GitHub CI führt den parallelen Regressionstest sowie den vollständigen TypeScript- und Next.js-Build auf Windows und Linux aus.
