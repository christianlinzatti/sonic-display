# V1036 · Laser & Atmospheric Arena

Erweitert die V1035-Rundbühne um drei separat einstellbare, ressourcenschonende Effekte:
- 6/12/18 transparente Laserfächer je nach Grafikstufe (keine echten Lichtstrahlen, kein Stroboskop).
- 24/60/120 Segmente eines beweglichen LED-Himmels, ohne eine blickdichte Decke.
- 5/9/14 shaderbasierte Bodennebelflächen mit 2/4/6 transparenten Rauchschwaden (keine echte volumetrische Rauchsimulation).
- Gemeinsame Showhöhepunkt-Regie: ein klassifizierter Hook oder Drop **und** eine kräftige gemessene Beatflanke,
  danach 18 Sekunden Sperrzeit. Zeitleiste allein triggert keine Höhepunkte und keine Pyro.
- Pause, reduzierte Bewegung, deaktivierte Musikreaktion und deaktivierte Einstellungen unterdrücken Bewegung;
  keine zusätzlichen Spotlights, externe APIs, Intervalle oder Postprocessing-Instanzen.

V1031–V1035 bleiben erhalten. Optionen unter Einstellungen → Dynamic Stage → 360° Arena.
Die bisherigen Stages, Lyrics und Kamerapositionen bleiben unberührt.

Prüfung: `npm run test:v1036`, `npm run test:v1036:types`, `npm run check:syntax`,
`npm run preflight:source`; vollständiger Next.js-Build wird in GitHub Actions unter Windows und Ubuntu geprüft.

