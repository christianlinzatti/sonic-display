# V1067 – Floating Platform Experience 2.0

Die bestehenden V1038-Schwebeplattformen nutzen jetzt eine optionale, szenengesteuerte
Choreografie mit sechs Looks: Halo, Ripple, Staircase, Orbit, Breath und Crown.
Die V1066-Formationsphase kann übernommen werden, ohne V1066 vorauszusetzen.
Alle Positionen stammen ausschließlich aus dem bestehenden V1038-Frame-Callback;
es gibt keine neuen Objekte, Zweit-Animation, Hardware-Kommandos oder Avatar-Transporte.

**Grenzen:** zusätzlich ±3,5 cm radial, +18 cm vertikal, ±0,028 rad Winkel;
Intervall pro Frame geglättet, auf 28 cm/s vertikal begrenzt. Die manuelle
Wahl von Welle/Orbit/Rise, Fußkontakte und bestehende Mechanik bleiben vorrangig.
Standardmäßig aus. Erfordert den aktiven 360°-Showplan, automatische
V1038-Plattformsteuerung und eine freigegebene Grafikstufe.

Tests: `npm run test:v1067`, `npm run test:v1067:types`, `npm run verify:v1067:focused`.
Der volle Windows-/Ubuntu-Next.js-/Playwright-Produktionsbuild muss nach dem
Import im Repository geprüft werden.
