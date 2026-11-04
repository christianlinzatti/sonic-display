# Sonic Display V570 – Verifikation (25.10.2026)

## Bestanden

- `npm run test:v570`: **76 neue Tests**, darunter GLB-Lade-/Mund-Rig-Evidenz, 15 Mode/Tier-Kombinationen, Low-Tier- und Duett-Fallback, Live-vs-Demo-Wortquellen, pausierter/veralteter Spotify-Clock, zeitlich gebundene und autorisierte Sängerrollen, Tanzclip-Abdeckung und ausdrücklich ungeprüfte WebGL-/Pi-Annahmen.
- `npm run test:v570:types`: isolierte Kern-Typprüfung.
- `npm run verify:v570`: **alle gezielten Release-Tests V554–V570** einschließlich isolierter TypeScript-Prüfungen erfolgreich.
- `npm run check:syntax`: **792 TypeScript/TSX-Dateien** in Syntax und Importbindungen überprüft.
- `npm run check:architecture`: 344 strukturierte Querverweise, Versions- und Abschnittsprüfung erfolgreich.
- Historische zusätzliche Regressionen: V383, V424, V465, V466, V498, V502, V511, V515, V518, V522, V526, V538, V542, V546, V547, V551, V552, V553 bestanden; darunter 43.200 Alpha-Gating-Testframes und die bisherige Duett- und Rap-Lip-Sync-Logik.
- Bei V546 wurde ausschließlich eine seit V561 veraltete Quelltext-Zeichensequenz geprüft; nun prüft der Test zusätzlich, dass manuelle Munddemos nicht überschrieben werden.
- `node scripts/v570-release-readiness.cjs --json`: Umgebungsstatus maschinenlesbar überprüft, kein falscher Build-Erfolgsbericht.

## Bewusst noch nicht verifiziert

- **Vollständiger TypeScript-Check/Next.js-Produktionsbuild nicht erfolgreich ausführbar:** `node_modules` und `package-lock.json` fehlen, die npm-Registry ist aus dieser Umgebung nicht erreichbar. `npm run typecheck` wurde versucht und meldet erwartete fehlende `next/server`-/Node-Typ-Module. `node_modules/.bin/next` fehlt – der echte Build konnte nicht gestartet werden. Das beweist **keinen** aktuellen Quellcodefehler mit vollständig installierten Abhängigkeiten, aber auch keine Build-Freigabe.
- **Keine visuelle Real-GLB-WebGL-Browserprüfung**, kein authentifizierter Spotify-Songtest, keine Hardwaremessung auf Raspberry Pi durchgeführt.
- **Keine realen FPS-, Heap-, GPU- oder Mehrstunden-Messwerte** behauptet. Die V569-Test-Simulationen bleiben technische Regressionen, keine Hardware-Messergebnisse.
- Da ein Lockfile fehlt, ist eine vollständig reproduzierbare Dependency-Auflösung noch nicht gewährleistet. Im Zielprojekt lokal Abhängigkeiten installieren und Lockfile absichern.

## Schutzumfang

V570 ergänzt einen readonly Vorschau-Audit und eine lokale Umgebungsprüfung; keine Änderung an der V561–V569-Mixer-/Vocal-/Lyrics-/Show-Director-Engine, kein neuer Render-Loop, keine neuen GPU-Objekte und keine Obergrenze für importierte Animationen. Das UI unterscheidet positive **Eingangsprüfung** von einer tatsächlichen visuellen und Hardware-Freigabe.
