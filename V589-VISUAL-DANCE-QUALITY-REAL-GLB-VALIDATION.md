# V589 — Visual Dance Quality & Real GLB Validation

**Basis:** V588. **Datum:** 26. Oktober 2026.

## Implementierung

- `visualDanceReviewV589.ts` nimmt ausschließlich den tatsächlichen V534-Sample-Report der Original-GLB entgegen und bereitet begrenzte, zeitlich sortierte Hinweise zu potenziell gleitenden Füßen, Hüft-/Root-Sprüngen, Animationskurven und Übergangspose auf. Kein automatisches Qualitätsurteil und kein tatsächlicher Bodenkontaktsensor. Die Markierungen sind auf die Clipdauer begrenzt.
- `VisualDanceReviewPanelV589.tsx`: klickbare Prüftimeline mit Seek in den **bereits existierenden realen GLB-3D-Viewer**, begrenzte Ereignisliste, manuelle Checkliste zur Sichtabnahme, lokal herunterladbares JSON-Protokoll mit offenem Review-Status. Kein verstecktes automatisches Abzeichnen. Checklistenstatus wird nur für das aktuelle Preview gespeichert und wechselt bei Clip-/Dateiauswahl nicht mit.
- `CharacterMotionBatchInstaller.tsx`: V589 ist unmittelbar unter dem bestehenden read-only V534-Inspektor angebunden, für Avatar-GLBs **und** separat importierte Motion-GLBs. Als Clipquelle dient `inspectAdvancedMotionV534` aus der Originaldatei. Der vorhandene `AvatarPreview3D` übernimmt die Sprungmarken. Bei externen Clips wird nur das Quellrig gemessen – Retargeting muss zusätzlich im 3D-Preview beurteilt werden.
- `MotionQualityOptimizerDashboard.tsx`: dieselbe Qualitätsansicht für bereits installierte GLB-Motions, optionaler Folgeclip und der existierende side-by-side 3D-Vergleich. Async-Inspektionen werden nach Datei- oder Clipwechsel entwertet.
- `longSongQualityProbeV589.ts` + `LongSongReviewPanelV589.tsx`: ein explizit **hypothetischer** Songdurchlauf (2–8 Minuten, Tempo 55–220 BPM, Deutschrap/Hardstyle/Hardtekk) über die **tatsächlich geladenen** Clipnamen/-dauern/-kanäle. Nutzt dieselbe *V588*-Auswahlfunktion mit einer als Beispiel definierten Intro-/Verse-/Hook-/Outro-Struktur. Zeigt Fenster, Repertoireumfang, direkte Wiederholungen und unbelegte Auswahlfenster. Jedes ausgewählte Beispiel lässt sich manuell in den realen 3D-Viewer laden. **Kein echter Spotify-Song, keine Songanalyse, kein automatisches Abspielen über mehrere Minuten.**

## Grenzen & Schutz

- V589 verändert **keine** GLB-Binärdatei, Animationskurven, Motion-Kategorien, importierten Clips, aktiven Animator-Prioritäten, IK, Lyrics, Lip-Sync, Kamera, Renderloop, GPU-Effekte oder Speicherstände.
- Die V534-Prüfung sampelt pro Clip maximal 81 von Three.js ausgewertete Skelettposen auf dem Quellrig (keine Skinning-Bildanalyse); Fußnähe am niedrigsten gesampelten Y ist eine Schätzung und darf nicht als bestätigter Kontakt gewertet werden.
- Der V589-Report ist eine technische Hilfestellung und erfordert **menschliche** Sichtabnahme im echten WebGL-Preview. Ein bestandenes Offline-Testskript bestätigt keine sichtbare Tanzqualität.
- Bei bereits installierten Motions zeigt der vorhandene V321-Vergleich ein retargetetes GLB in zwei voneinander unabhängigen Canvas-Views; der V534-Sample-Report stammt weiterhin aus der ursprünglichen Motion-GLB, daher können sichtbare Retargeting-Abweichungen nur durch den Nutzer festgestellt werden.
- Es wurden in dieser Umgebung keine GLB-Animationen im WebGL-Browser oder auf einem echten Raspberry Pi optisch abgenommen. Für Produktion sind außerdem vollständiger `npm install`, `npm run typecheck`, `npm run build` und ein Hardware-Benchmark erforderlich.

## Bedienung

**Einstellungen → Avatar-/Motion-Import → Clip wählen → V534 „Fußkontakt, Gelenke und Übergang analysieren“ → V589-Prüftimeline**. Marker tippen und in der 3D-Vorschau den betreffenden Zeitpunkt betrachten, bei Bedarf Folgeclip auswählen. Sichtprüfung abzeichnen und JSON herunterladen.

Für installierte Motions: **Einstellungen → Motion-Bibliothek → Advanced Motion Quality Studio → Motion laden → Original-GLB-Pose prüfen**; optional Modell als 3D-Vergleich öffnen und die V589-Mehrminuten-Repertoireprobe durchgehen.

## Tests

- `npm run test:v589` (reine Logik, 25 Testgruppen, 10.000 simulierte Zeitpunkte).
- `npm run test:v589:types` (isolierter Pure-TypeScript-Test).
- `npm run test:smoke:v589` (zurückreichende, zeitlich begrenzte Regressionen).
- `npm run verify:v589` (erweiterte Bibliotheks-/Choreografie-Regressionen).
