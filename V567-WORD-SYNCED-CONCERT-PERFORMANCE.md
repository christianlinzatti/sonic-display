# V567 – Word-Synced Concert Performance

## Änderung

- Pure `sampleWordConcertV567()` auf **bereits existierenden** V415-Wortfenstern. Leere Lyrics, Instrumentalpassagen, Zeitlücken, Pausen, schlechte Timestamps oder Reduced Motion ergeben explizit `none`/`paused`/`line`; niemals erfundene Wortakzente.
- V523/V526 Gesicht: zusätzliche, maximal 0,0035 Wangen- und 0,002275 Augenbrauen-Auslenkung, **keine Veränderung** von Kiefer, Lippenverschluss, Morph-Zielen oder manuell editierten Mundbewegungen.
- V564 GLB-/Procedural Rap-Körper: nur vorhandene additive Gesten werden innerhalb bestätigter Wortintervalle weich begrenzt; Mehrfachbesetzung nur mit autorisiertem Cast und aktivem Sänger. V515 begrenzt GLB danach weiterhin.
- 3D-Karaoke: maximal 0,0035 Skala und 0,0012 Outline extra auf das genau passende, verifizierte Wort. Text, **Karaoke-Fill**, Positionen und reduzierter Bewegungsmodus bleiben gleich. Low-Tier führt keinen zusätzlichen Gesichts-, Tanz- oder Karaoke-Akzent aus; Balanced-Tier unterdrückt nur den zusätzlichen Karaoke-Akzent.
- Vocal Sync Inspector V373 zeigt belegtes Wortfenster oder den verlässlichen Line-Fallback.

## Grenzen

Wortmarken und Lyrics entstehen bei den bestehenden Providern. Wort-Timestamps sind **keine** tatsächliche Phonem- oder Stimmenanalyse. Die bestehende Benutzerkorrektur von Mund-, Visualisierungs- und Karaoke-Zeitversatz bleibt erhalten (dadurch können sichtbare Signale absichtlich unterschiedlich versetzt sein). Ein aktueller Song mit nur Zeilen-Timestamps erhält lediglich die bisherige Zeilensteuerung, keine künstlichen Wortimpulse. Ohne bestätigte Duettbesetzung werden keine Avatar-Gesten zugeordnet. Neue 3D-Karaoke-Akzente nur auf hoher Grafikstufe.

## Prüfen

`npm run verify:v567` – testet V567 und die vorherigen gezielten Releaseketten. `npm run test:v567` führt isoliert die neuen deterministischen Regressionen aus. Vollständiger Production-Build, echte GLB- und Raspberry-Pi-Sichtprüfung müssen separat durchgeführt werden.
