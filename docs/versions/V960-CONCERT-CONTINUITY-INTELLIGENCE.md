# Sonic Display V960 — Concert Continuity Intelligence

**Basis:** vollständige V959 (4.352 Dateien) · **Status:** lokaler Entwicklungsstand, keine Produktionsfreigabe.

## Neue Funktionen

- **Opt-in für bessere Songübergänge:** V960 verwendet ausschließlich zwei benachbarte, mit mindestens 0,5 Konfidenz gekennzeichnete, importierte V318-Songabschnitte. Verse, Hook, Build, Drop, Break und Outro erhalten unterschiedliche, genreangepasste Übergangszeiten (Drop kürzer als Break).
- **Kamera-Abwechslung:** Wenn zwei benachbarte automatisch geplante Szenen exakt dieselbe Kamera und Formation verwenden, wählt V960 eine andere, deterministische Kameraperspektive. Gespeicherte V948-Cues, manuelle V354-Regie und explizite Duo-/Avatar-Auswahlen behalten ihre Priorität.
- **Vorsichtige Govee-Übergänge:** Die bestehende V937-Lichtmischung erhält ein sanftes, aus dem Songfortschritt berechnetes Übergangssignal. Keine zusätzlichen HTTP-/UDP-Befehle, keine separaten Timer, kein zusätzliches Polling. V912-Lichtshows und V915-Gruppenlimits bleiben erhalten. Keine automatischen Strom-, Blitz- oder Strobebefehle.
- **Kompaktes 3D-FX-Profil:** Optional maximal zwei virtuelle Effekte statt drei, reduziert auf einen ruhigen Effekt bei `reducedMotion`. Effekte verwenden denselben React-Three-Fiber-Canvas samt bestehendem Renderloop. Kein zusätzlicher Renderer und kein dynamischer Shader.
- **Studio-Oberfläche:** Zwei neue Schalter im bestehenden Concert Roadmap Studio, plus ein wahrheitsgemäß gekennzeichneter synthetischer Szenen-Audit und Qualitätsindikator für echte bestätigte Songphasen.

## Bedienung

Unter **Einstellungen → Govee LAN → Ultimate Concert Experience Studio** die Konzertregie einschalten. Danach optional **V960: Sanfte Verse/Hook/Drop-Übergänge** aktivieren. Für schwächere Geräte zusätzlich **V960: Kompaktes 3D-FX-Profil** einschalten. Physische Lichtbefehle erfordern weiterhin die separate vorhandene Govee-Hardware-Opt-in-Option und alle bestehenden V909–V929-Gates; ansonsten ist die Vorschau rein virtuell.

**Kompatibilität:** Die V958-Einstellungsschlüssel und V912-Lichtshows bleiben unangetastet. Beide neuen V960-Felder sind bei bestehenden Konfigurationen standardmäßig deaktiviert. `package.json` bleibt für ältere Regressionen technisch bei `0.1.0-v908`, enthält aber den Roadmap-Marker `v960`.

## Tests

- `node tests/v960-concert-continuity-regression.cjs`: 45 Gruppen und 5.000 deterministische Varianten, PASS.
- `tsc -p tests/tsconfig.v960-core.json --noEmit`: PASS.
- `node scripts/v959-regressions-only.cjs`: 28 unabhängige Test-Suites, parallel mit drei Workern, PASS.
- `node tests/v86513-windows-source-eol-regression.cjs`: 10 CRLF-Simulationen, PASS (alte Kameratests auf tatsächlich vorhandene V898-Abschluss-Sicherheitsprüfung aktualisiert).
- Vorhandene V958-Regressionsgruppe: 71 Tests, PASS.
- Vollständiger App-TypeScript-Check, `npm ci` und Next.js-Produktionsbuild: **lokal nicht verifiziert**, da das vollständige Projekt-`node_modules` fehlt. `scripts/v960-production-verify.cjs` meldet dies absichtlich als Fehler. Die `.github/workflows/v960-concert-continuity.yml` führt die vollständigen Checks auf Windows und Ubuntu durch, sobald das Projekt dort importiert ist.

## Sicherheit und Ressourcen

V960 ist eine reine Berechnungsschicht: kein Audio-Mitschnitt, keine neuen Credentials, keine neuen Netzverbindungen, kein extra Renderloop. Ohne bestätigte Analysesequenz fallen Übergänge auf die bisherige V958-Regie zurück. Bestehende lokale Shows und Timelines werden nicht automatisch geändert. Govee-Hardware-Kompatibilität und Raspberry-Pi-Performance können nur mit realen Geräten beobachtet werden.
