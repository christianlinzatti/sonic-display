# V1082 · Dynamic Stage Architecture

## Umfang

- Neue, optional zuschaltbare drei **Kulissenebenen** außerhalb der 360°-Künstlerplattform (Radius 3,98–4,14 m). Zuschauer und echte Künstler laufen weiterhin auf ihren bestehenden Plattformen.
- Sechs szenische Formationen: **Gate** (Intro), **Arcade** (Strophe), **Staircase** (Aufbau), **Terraces** (Hook), **Colonnade** (Zwischenspiel), **Crown** (Finale). Langsame optische Höhen-, Radius- und Drehungsänderungen folgen dem autorisierten Showplan.
- Drei `InstancedMesh`-Batches: höchstens 24 Traversenpfosten, 24 LED-Streifen und 16 Verbindungsstege, keine neuen echten Lichtquellen, Modelle, Schatten, Musik- oder Hardwarecontroller. Auf Low-Tier **kein Rendering**; Balanced hat 6 statt 8 Module.
- Kein falscher Beat aus geplanten Hooks: LED-Akzente nur bei tatsächlich gemessenen starken Beats. Bei Pause wird die Pose gehalten; `Reduced Motion` parkt die dynamische Kulisse. Ein manuell gewählter Deck-Modus hat Vorrang.
- Aktivierung über **AI Show Designer → V1082 Dynamic Stage Architecture**. Standardmäßig deaktiviert. Benötigt einen gültigen Showplan und den automatischen Deck-Modus.

## Prüfungen

- `npm run test:v1082` – 192.000 begrenzte Samples, alle sechs Songabschnitte, ungültige Zeiten, manuelle Steuerung, Low-Tier und Pausen.
- `npm run test:v1082:types` – isolierte strikte TypeScript-Prüfung des Planners.
- `npm run verify:v1082:focused` – V1082 plus Regressionen von V1081/V1080 und Release-Preflight.
- `node scripts/v959-source-preflight.cjs` – sämtliche historischen Release-Gates.

**Produktionsstatus:** Diese lokalen Prüfungen ersetzen keinen GitHub-Actions-Lauf mit Windows/Ubuntu, Next.js-Produktionsbuild, Playwright und anschließendem Deployment-Test.
