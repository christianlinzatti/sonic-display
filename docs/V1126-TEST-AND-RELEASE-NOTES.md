# V1126 – Test- und Release-Hinweise

## Funktionstests

`npm run test:v1126` testet 256 Kombinationen aus Genre, vier Showprofilen,
Stärken und Caps. Die Testreihe überprüft neun vollständige Regieentwürfe,
Indikatoren für sechs Übergänge, originale Zeitgrenzen, manuell bearbeitete
Timings, Fail-Closed mit manipulierten Direktoren, ruhige Atempause,
begrenzte virtuelle Live-Presets sowie eine syntaktisch gültige UI.

`npm run test:v1126:types` prüft den vollständig transitiven Kern inklusive
V1117–V1125-Typen. `tests/e2e/ai-festival-show-master-v1126.spec.cjs` enthält
Playwright-Proben auf realem Desktop-/Touch-Chromium.

Die komplette GitHub-Actions-Produktion (Windows, Ubuntu, Playwright und
Soak) ist erst **nach dem Import der ZIP** bestätigt. Lokale Tests sind kein
Nachweis für einen erfolgreichen GitHub-Produktionsbuild.
