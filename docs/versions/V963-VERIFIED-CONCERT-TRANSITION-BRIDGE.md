# V963 – Verified Concert Transition Bridge

Intelligente, optionale Vorbereitung auf echte, bestätigte Hook- und Drop-Abschnitte.

## Funktionsweise

- Analysiert **nur die bereits importierten V318-Songabschnitte** derselben Track-ID.
- Verlangt einen gültigen aktuellen Abschnitt (`confidence >= 0,5`), einen unmittelbar anschließenden Hook/Drop (`confidence >= 0,65`) und höchstens 1.000 ms Abweichung an der Abschnittsgrenze.
- Erst in den letzten **1.400 ms vor einer Hook** bzw. **1.800 ms vor einem Drop** senkt die vorhandene automatische Lichtregelung sanft die Helligkeit ab. Am tatsächlichen Abschnittswechsel überlässt V963 die Wirkung vollständig V962 und dem V961-Governor.
- Charakteristische Intensität für Deutschrap bzw. Hardtekk/Hardstyle, konservative reduzierte Bewegungsoption.
- Neue Option **V963: Spannungsaufbau** im bestehenden Concert Studio; **standardmäßig deaktiviert**. Das Speicherschema und der Speicherschlüssel bleiben unverändert.
- V912 gespeicherte Shows, V354 autorisierte Bühnenszenen, V948 manuelle Timeline-Cues, Pausen, ungültige Analysen und sich erholende Geräte haben Vorrang.
- **Keine** zusätzlichen Netzwerkanfragen, Timer, Multicast-Scans, Lampen-Power-Kommandos, Stroboskop-Kommandos oder Renderer-Ressourcen.

## Validierung und Release

- `npm run test:v963`: deterministic plan, safety boundaries, compatibility, 7.500 Datenfälle.
- `npm run test:v963:types`: isolierter V963- und Kern-TypeScript-Check.
- `npm run verify:production:v963`: V963 und vollständig übernommene V962/V961/V960-Regressionen, vollständiger `tsc --noEmit`, echter Next.js-Produktionsbuild. GitHub testet Linux/Windows getrennt.
- Nach dem Import in GitHub können die plattformspezifischen Proof-Dateien aus dem V963-Workflow heruntergeladen werden. Ein Testbericht vor dem Import ist **keine** Produktionsfreigabe.

## Dokumentationsstruktur

Neue Versionsdokumentation: `docs/versions/`. Changelogs: `changelog/`. Bestehende Einstellungen, Shows, Camera-/Motion-Timelines und Spotlight-Profile werden nicht migriert oder überschrieben.
