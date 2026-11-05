# Sonic Display V889 – Advanced Particle FX

## Änderungen

V889 fügt dem bestehenden **Live FX Deck** eine zuschaltbare intelligente Partikelmischung hinzu, ohne neue Renderobjekte oder einen zweiten Konzertcontroller einzuführen. Verwendet werden die bereits vorhandenen 3D-Emitter aus V816, V817, V844.1, V846 und V847 (Konfetti, Schaumkanonen, Seifenblasen und Papier-Luftschlangen). Der neue Director wird **nach** V871 (Festival-Koordination) und V880 (Konzertdramaturgie) aufgerufen und kann bei autorisierten Effekten **nur bestehende Dichte, Transparenz und Bewegung verringern**. Es werden weder Partikel erhöht oder neu aktiviert noch manuelle FX-Timelines überschrieben.

## Bedienung

Im **Live FX Deck → V889 Advanced Particle FX** lassen sich die Automatik, die vier Partikeltypen als unabhängige Mischkanäle, Genre-Stimmung (Auto / Noir / Electric / Arena / Dream), Dramaturgie (Ausgewogen / Cinematic / Festival), bevorzugter Effekt und Mischintensität einstellen. Einstellungen werden unter `sonic-advanced-particle-director-v889` lokal gespeichert. Ein JSON-Export zeigt vorgeschlagene Prioritäten **nur** für bestätigte Songabschnitte; diese entsprechen nicht automatisch garantierten Emissionen.

- Strophe / Break: ruhige Seifenblasen bevorzugt
- Build-up: Schaum (Hardtekk) oder Luftschlangen
- Hook: genreabhängig Luftschlangen, Konfetti oder Seifenblasen
- Drop / Finale: Schaum oder Konfetti, sofern die vorhandene Regie sie bereits autorisiert

Falls eine effektive Partikelart nicht aktiv ist, wird nur unter den **bereits aktiven** Kandidaten gewählt.

## Schutzregeln

Keine V889-Änderung bei Pause, Trackwechsel, Spulen/Seek-Sperre, fehlender oder nicht bestätigter V604-Timeline, Bewegung reduzieren, Low-Tier, Blackout, manueller Licht-/Effektsteuerung oder – bei aktivem Schutz – Lyrics-Fokus. Individuell geschriebene `particles`- und `foam`-Timelines bleiben jeweils bitgenau erhalten. Die FX-Budgets aus V823/V825 bleiben maßgeblich. Es wird keine echte Hardware gesteuert und kein Strobe/Full-Stage-Flash hinzugefügt.

## Prüfungen

- `npm run test:v889`
- `npm run test:v889:types`
- `npm run test:v889:ui-types`
- `npm run verify:v889:focused` (ältere V888 bis V880 + historische Tests)
- `npm run typecheck`
- `npm run build`
- Windows: `powershell -ExecutionPolicy Bypass -File scripts/verify-v889-windows.ps1`

**Release-Einschränkung:** Die fokussierten Tests können offline mit lokal vorhandenem `node`/`tsc` laufen. Ein vollständiger Next.js-Produktionsbuild erfordert alle Projekt-Abhängigkeiten aus `npm ci` sowie einen echten Browser/WebGL-Test. Nicht ausgeführte Prüfungen sind nicht als erfolgreich zu markieren.
