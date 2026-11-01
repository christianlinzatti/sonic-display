# Sonic Display V771 – Automatischer Langzeit-Stabilitätstest

## Implementiert

- `npm run test:v771:browser` startet einen eigenen, lokalen Headless-Chromium-Test mit **einem echten WebGL-Canvas**.
- Standard: 90 Messzyklen in 6 Blöcken zu 15 Zyklen, jeweils nach zwei Warm-up-Runden. Die V767-Harness verwendet sechs echte Bühnen und mindestens zwei Avatarvarianten (mindestens **1080** Bühnen-/Avatar-Kombinationen in den Messzyklen).
- Mit `--model=/pfad/zu/avatar.glb` können bis zu vier gleichursprüngliche GLBs geprüft werden; keine fremden Server oder Spotify-Verbindung erforderlich.
- Nach jedem Block werden UI-/Renderer-Werte nach einer Abkühlphase und der JavaScript-Heap über Chrome DevTools nach Garbage Collection gemessen.
- Die Auswertung vergleicht gleiche **Ankerszenen**: WebGL-Geometrien, Texturen, Shaderprogramme; optional JS-Heap nach GC und das geschätzte ungenutzte GLB-Cachebudget. Einzelne Ausreißer gelten nicht als Leak.
- Status `stable`, `suspect`, `inconclusive` oder `blocked`; als maschinenlesbarer JSON-Bericht unter `artifacts/v771/longrun-report.json` inklusive Fortschritt für bereits beendete Blöcke.
- Fehlende Samples, Kontextverlust, deaktiviertes WebGL oder nicht erreichbarer lokaler Server führen nicht zu einem falschen „stable“.
- Keine automatische Freigabe aktiver Avatar-Ressourcen, keine neue Live-Konzert-Renderloop, kein Cloud-Upload.

## Start auf Windows / im Projektordner

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

In einem **zweiten Terminal** (der Server muss weiterhin laufen):

```bash
npm run test:v771:browser -- --cycles=90 --batch=15
```

Optional weitere Modell-URLs (müssen vom Next.js-Server ausgeliefert werden):

```bash
npm run test:v771:browser -- --cycles=120 --batch=20 --model=/models/performer.glb --out=artifacts/v771/mit-avatar.json
```

Fehlersignal für CI: Exit-Code 0 für unauffällig, 2 für Verdacht und 1 für Fehler/nicht auswertbar. Mit `--max-minutes=90` und `--settle-ms=800` anpassbar.

Die bestehende lokale Seite `/diagnostics/gpu-memory?gpuLeakV767=1` bietet weiterhin einen einfachen 30-/90-Zyklen-Schnelltest. Die **vollständige V771-Mehrblockauswertung** erfolgt über den Browserbefehl.

## Aussagegrenzen

`gl.info.memory` zählt WebGL-Ressourcen und misst keine tatsächlichen VRAM-Bytes. Auch CDP-`JSHeapUsedSize` ist kein vollständiges Maß für GPU- oder Prozessspeicher. `stable` bedeutet: Unter den getesteten Voraussetzungen **kein anhaltender Anstieg nachweisbar**, nicht „kein Speicherleck vorhanden“.

## Qualitätsprüfung

```bash
npm run test:v771
npm run verify:v771:static
npm run typecheck
npm run build
```

Die statischen Tests laufen ohne WebGL; eine echte Langzeitmessung muss auf einem Rechner mit laufendem Sonic Display und Chromium erfolgen.
