# Sonic Display V779 – Reproduzierbarer Konzert-Qualitätsprofiltest

## Ziel

V779 testet **reale Browser-Renderzeiten** der bestehenden V777-Konzert-Fixture in drei Profilen und wählt anschließend das optisch aufwendigste Profil, das ein festes FPS-/P95-Ziel in **jeder** Testsituation und **jeder** Wiederholung erreicht. Alle sechs V777-Szenarien (Cyberpunk, Rock, Galaxy × 2/4 GLBs) laufen weiterhin mit echten GLB-Animationen, 3D-Lyrics, Lights und Morphs. Das Audiosignal ist aber synthetisch, nicht Spotify-Liveaudio. Keine echten Messungen in dieser Entwicklungsumgebung erfinden.

## Profile

| Profil | Bühnen- und Lichtreaktion | DanceFX | Knochen-/Mund-Updates |
| --- | --- | --- | --- |
| `cinematic` | Dynamische Bühnenbeleuchtung, Stärke 72, Animation aktiv | Ring, Abdrücke, Spuren, Stärke 80 | jedes Renderframe |
| `balanced` | Dynamische Beleuchtung, Stärke 52 | Ring/Spuren, keine Abdrücke, Stärke 55 | jedes zweite Renderframe, Zeit fortgeschrieben |
| `economy` | Reduzierte Bühne, keine reaktive Lichtregie, Stärke 30 | ausgeschaltet | jedes dritte Renderframe, Zeit fortgeschrieben |

Dies ist **kein Geometrie-LOD**, denn GLB-Polygone/Materialien bleiben unverändert. Insbesondere bei den Bewegungs-Update-Stufen kann die optische Bewegungsqualität leiden; vor automatischer Übernahme visuell prüfen.

## Vorbereitung (Windows/macOS/Linux)

```bash
npm ci
npm run typecheck
npm run build
npm run start
```

Eigenen produzierbaren GLB-Avatar mit Rig, Dance-Animation und einem Mund-Morph unter `public/benchmark/mein-avatar.glb` ablegen.

## Echte Messung

In einem zweiten Terminal:

```bash
npm run benchmark:v779:sweep -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb --rounds=2 --target=45 --avatars=4
```

Optional: `--glb2=/benchmark/mein-zweiter-avatar.glb`, `--rounds=3`, `--target=30|45|60`, `--avatars=2|4`, `--warmup=60`, `--frames=180`, `--passes=2`, `--chromium=/Pfad/zu/chromium`, `--out=artifacts/v779/mein-report.json`.

**Ablauf:** Runde 1 Cinematic → Balanced → Economy, Runde 2 umgekehrt. Jeder Unterlauf startet einen echten Chromium-Prozess, führt einen Shader-Warmup und die sechs Messszenen aus und schreibt einen JSON-Bericht. Zwei volle Runden sind Pflicht; keine Vorschläge bei blockierten Läufen. Die vollständige Testreihe kann mehrere Minuten beanspruchen.

Ausgaben:
- `artifacts/v779/runs.json` – vollständige Rohdaten der tatsächlich durchgeführten Browserläufe
- `artifacts/v779/run-01-cinematic.json`, `run-02-balanced.json`, usw. – Einzelmessungen
- `artifacts/v779/quality-sweep.json` und `quality-sweep.md` – konservative Bewertung

Die Berichte lassen sich auch lokal unter `/diagnostics/concert-profiles` importieren. Keine Datenübertragung, keine neue WebGL-Instanz für die Analyse.

## Offline neu bewerten

```bash
npm run benchmark:v779:assess -- --input=artifacts/v779/runs.json --target=60 --avatars=4
```

## Ausschlussregeln und Aussagegrenzen

- Jede Runde muss drei vollständige, echte Browserläufe enthalten, in der vorgesehenen Reihenfolge, jeweils sechs eindeutige V777-Szenen.
- Profilkennzeichnung wird **innerhalb des V777-Berichts** festgehalten und vom Test geprüft. V777 Vorher-nachher-Berichte mit unterschiedlichen Qualitätsprofilen werden nicht als identische Fixture verglichen.
- Hardware/Browser, DPR, Auflösung, GLB-SHA-256, Konfiguration, Sample-Anzahl und Verwendungsmodus müssen **identisch** sein.
- Software-/SwiftShader-Renderer werden als nicht auswertbar abgewiesen.
- Zielerreichung pro Szene: P95 ≤ 1000 / Zielfps und gemessene FPS ≥ Zielfps. Jede Wiederholung muss den Grenzwert halten; > 25 % Messstreuung gilt als instabil.
- Die Reihenfolge ist umgekehrt, aber V779 beseitigt nicht alle Umgebungsstörungen (Temperatur, Browser-Kompositor, andere Prozesse). Immer GPU-Belastung und visuelle Qualität prüfen.
- Die mitgelieferte winzige V777-Referenz-GLB ist für Hardwarekäufe nicht aussagekräftig. Es gibt **keine Raspberry-Pi- oder Mini-PC-Freigabe** ohne Messung auf Zielhardware.
- Die Empfehlungen werden **nicht** selbsttätig ins Live-System übernommen.

Die bestehende Backport-Funktion `npm run benchmark:v777:backport -- --target=...` liefert nun auch die neue V779-Profildefinition mit. Dadurch bleibt die mit V779 ausgestattete V777-Fixture in älteren Projektständen baubar.

## Prüfung

```bash
npm run test:v779
npm run test:v779:types
npm run verify:v779:static
```

Echte V779-Browsermessungen und der vollständige Next.js-Produktionsbuild müssen in einer Umgebung mit installierten npm-Abhängigkeiten separat durchgeführt werden.
