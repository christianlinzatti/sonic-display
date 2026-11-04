# V648 – Ultimate 10-Inch Display Experience

V648 macht den bestehenden Kiosk für typische 10-Zoll-Browserfenster besser les- und bedienbar. Sie implementiert keine pauschale Bildschirmgrößen-Erkennung anhand von Hardwaremodellen und enthält keine Raspberry-Pi-Leistungsmessung.

- **Lesbarkeit:** Drei lokale Schriftdarstellungen (Normal, Klar, Groß); CSS-Textanpassung für DOM-Lyrics, optionale sanfte Font-Skalierung für WebGL-Lyrics. Eigene Lyrics-Zeitstempel und Farben bleiben unverändert.
- **Touch-Erreichbarkeit:** mindestens 48 CSS-Pixel hohe Bedienelemente; sichtbare 52×52-Wecktaste nach automatischer Ausblendung; Focus- und Safe-Area-Schutz; Diagnose bleibt über „Mehr · Display“ erreichbar.
- **Responsive:** Automatische kompakte Querformatdarstellung bis 1440×820 CSS-Pixel sowie optionales Hochformat, ohne laufende Frame- oder GPU-Messung.
- **Rücksicht:** Alles ausschließlich bei aktivem Touch-/Kioskmodus. Keine Spotify-/Audio-Steuerung und keine unverifizierten Avatarpositionen.

## Grenzen

Die finalen Schriftgrößen müssen auf dem Ziel-Browser bei 1024×600, 1280×800, 1366×768 und optionalem Hochformat visuell geprüft werden. Bei sehr langen Lyrics können weiterhin mehrzeilige Umbrüche auftreten. Es gibt noch keinen physischen Raspberry Pi und keine gemessenen WebGL-FPS in dieser Version.

## Lokal prüfen

`npm install`, `npm run test:v648`, `npm run verify:v648`, `npm run test:smoke:v648`, `npx tsc --noEmit`, `npm run build`.
