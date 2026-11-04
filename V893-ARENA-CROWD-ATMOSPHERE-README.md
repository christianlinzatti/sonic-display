# Sonic Display V893 – Arena Crowd Atmosphere

**Neu:** Eine gemeinsame, songgebundene Publikumsregie moduliert vorhandene
V815-Instanzen für Handylichter, seitliche Publikumswellen und dezente
Silhouettenbeleuchtung. Die bereits animierten Arme und Handgelenkbänder aus
V874–V879 bleiben erhalten. Kein zusätzlicher 3D-Mesh, keine Textur und keine
neue Lichtquelle. Maximal 72 Personen, höchstens 20 Instanzupdates pro Sekunde.

## Bedienung

Unter **✦ LIVE FX → V893 Arena Crowd Atmosphere** sind die Automatik,
Stile (Auto, Cinematic, Ausgewogen, Festival), Intensität, Handylichter,
Publikumswellen, Silhouetten-Glow und Lyrics-Schutz regelbar. Die Einstellungen
werden unter `sonic-arena-crowd-v893` im Browser gespeichert. Ein bestätigter
Szenenplan lässt sich als JSON exportieren.

## Funktionsgrenzen

V893 arbeitet nur mit der bereits bestätigten V604/V885-Timeline. Intro,
Strophe, Build-up, Hook, Drop, Break und Finale erhalten abgestufte Gewinne.
Bei fehlender Timeline, Pause, Spulen, Blackout, manueller FX-/Lichtregie,
Low-Tier, Reduced Motion oder deaktiviertem virtuellem Publikum unterbleibt
jede V893-Modulation. V893 aktiviert kein deaktiviertes Handylicht und
verlässt den freien Bühnenmittelgang nicht. Die Basisbewegung bleibt durch
V815/V876/V879/V880 und den Performance-Governor V825 begrenzt.

## Prüfung

```powershell
npm ci
npm run verify:v893:focused
npm run typecheck
npm run build
npm run dev
```

Ein vollständiger Next.js-Build und echte Browser-/WebGL-/GPU-Tests sind
unabhängig von den isolierten TypeScript- und fokussierten Tests abzunehmen.
