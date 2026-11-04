# Sonic Display V634 – Beautiful Lyrics 2.0

## Verbesserung

- **10-Zoll-Lesbarkeit:** Die vorhandenen V578/V598/V606/V619-Breiten werden nie erweitert; lange Zeilen und 3–4 Performer werden vorsichtig enger gesetzt. Schriftgröße und Lyrics-Position aus den Benutzereinstellungen bleiben unangetastet.
- **Kontrastschutz:** Die bestehende Caption-Plate wird bei dichter Bühne und einem bestätigten V528-Vokalauftritt höchstens verstärkt, niemals abgeschwächt. Für normale und immersive DOM-Lyrics gilt derselbe Plan; auch die vorhandene 3D-Troika-Plane verwendet den erhöhten Kontrast.
- **Wortakzente:** Ein schwacher, weich ein-/auslaufender Halo wird nur während des jeweils aktuell bestätigten Wort-Zeitfensters erzeugt. Keine erfundenen Wörter, Silben, Phoneme, Rollen, Metadaten oder Timestamps; V477/V541/V549 bestimmen weiterhin das Karaoke-Fill.
- **Deutschrap & mehrere Tänzer:** Der tatsächliche mittlere Wortabstand steuert kürzere/ruhigere Übergänge bei schneller Wortfolge; dicht gepackte Zeilen und vier Performer verringern dekorative Akzente.
- **Keine neuen Effekte:** Das Projekt verwendet bestehende DOM-Spans, Troika-Textmeshes, Caption-Plane und R3F-Renderloop. Kein GPU-Mehrbedarf durch neue Assets; CPU-Kosten sind erst auf echter Hardware zu messen.

## Vorrang / Abschaltregeln

Keine optische Wortbetonung bei inaktiver Wiedergabe, nicht synchronisiertem Text, fehlenden/geprüft ungültigen Wort-Zeitstempeln, deaktivierter Wortmarkierung, Animationstärke 0 oder `prefers-reduced-motion`. In solchen Fällen bleiben Lyrics und ihre Kontrastflächen lesbar. Benutzerdefinierte Schriftarten, Schriftgrößen, Farben, Lyrics-Positionen, Layer und bestehende Kamera- sowie Cast-Schutzregeln werden nicht geändert.

## Verifikation

- `npm run test:v634` – V634-Funktions- und Integrationstests.
- `npm run test:v634:types` – TypeScript-Kernprüfung.
- `npm run test:smoke:v634` und `npm run verify:v634` – regressionssicherer Lauf der älteren Lyrics- und Konzerttests.
- Auf dem Windows-Rechner zusätzlich `npm install`, `npx tsc --noEmit`, `npm run build` und echte Song-/Avatarprüfungen im Browser.

**Keine visuelle 10-Zoll-/GLB-Abnahme aus synthetischen Tests ableiten.**
