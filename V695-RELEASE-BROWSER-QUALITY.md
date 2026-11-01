# V695 – Release- und Browser-Qualitätsprüfung

## Umfang

**Neu:** `scripts/v695-release-quality-gate.cjs` und `scripts/v695-browser-qa-smoke.cjs` mit gezielten Regressionstests. Keine Änderung an Song-, Motion-, Licht- oder Lyrics-Regie. V694-Aufgaben und Backups bleiben kompatibel. Kein neues Render-Material, kein GPU-Pass und keine erfundene Bewertung.

Das Gate prüft der Reihe nach:

1. Projektmanifest und **gültiges, zum Manifest passendes `package-lock.json`**.
2. **Alle** 17 benötigten npm-Abhängigkeiten lokal installiert.
3. Tatsächlich erfolgreiches `npm run typecheck` – nicht bloß ein isoliertes Test-TS-Config.
4. Tatsächlich erfolgreiches `npm run build`, inklusive `prebuild`/schneller Regression.
5. Bei explizitem `--url`: **reale localhost-Anwendung** im eigenen Chromium-Testprofil. QA-Schaltfläche öffnen, die gespeicherte V694-Historie aufrufen und nach Navigation/Reload nachweisen. Ein manueller Aufgabenstatus muss durch ein React-Select geändert werden und den nächsten Reload überstehen.
6. WebGL Canvas in derselben echten App – vorhanden heißt nicht gutes Bild.
7. Optional frischer V592-Bericht mit laufender Spotify-Wiedergabe, wenigstens einer realen GLB-Mesh-Gruppe, mehreren echten PNG-Captures, gemessenen Frames und echtem Songfortschritt. Auch hier keine Behauptung guter Animation oder Gesichtsqualität.
8. Verbindliche **manuelle Sichtprüfung** (ohne automatisches Bestanden): 1/2/4 GLB-Darsteller, Pose/Foot-IK, Verse/Hook/Drop, Lyrics-Kontrast, Performer-Köpfe, Kamera, Moving Heads/Gobos/Bodennebel, Deutschrap-Lip-Sync, längere Show-Performance und QA-Restore nach Browserneustart.

## Auf Entwickler-Rechner (Windows 11, PowerShell)

```powershell
npm install
npm run test:v695
npm run test:v695:types
npm run test:quick
npm run typecheck
npm run build
npm run start
```

In **zweitem PowerShell-Fenster** (während App unter `127.0.0.1:3000` läuft):

```powershell
npm run audit:v695:browser -- --url=http://127.0.0.1:3000/ --out=artifacts/v695/qa-browser
npm run benchmark:v695:real-glb
npm run audit:v695:release -- --url=http://127.0.0.1:3000/ --live-report=artifacts/v592/live/report.json
```

Wenn Spotify noch nicht eingeloggt ist, kann der isolierte Browser-Smoketest die QA möglicherweise nicht öffnen: Die Prüfung meldet `blocked`, nicht `passed`. Der V592-Benchmark benötigt den **laufenden echten Song** und aktive GLB-Avatare. Der Browser-Smoketest verwendet ein **eigenes frisches Chromium-Profil** und liest keine Spotify-Cookies/Benutzerdaten des regulären Browsers; er schreibt eine minimale, testbezogene V694-Aufgabe nur in dieses Profil. Nur localhost/127.0.0.1/IPv6-Loopback ist erlaubt; unbekannte Optionen oder externe URLs werden verworfen.

**Wichtig:** Ein aktives Browser-WebGL beweist keine echte GLB-Show. V592 erfordert eine andere, echte angemeldete Wiedergabesitzung. Für die manuelle Sichtkontrolle Browser-Screenshots und Konzertzeitmarken verwenden. `npm run audit:v695:browser:fixture` prüft ausschließlich die Browser-/CDP-Technik, wird im Bericht ausdrücklich als `test-fixture` markiert und zählt **niemals** als Produktnachweis. In verwalteten Umgebungen kann Chromium Loopback-Requests administrativ blockieren.

## Protokoll und Statusregeln

`artifacts/v695/release-quality.json` enthält explizite Prüfschritte mit `passed`, `blocked`, `failed`, `not-run` oder `manual-required`, die tatsächliche Umgebung und `approved:false`. Das CLI gibt bei fehlenden technischen Belegen **Exit 1** zurück. Selbst wenn alle sieben technischen Nachweise vorhanden sind, meldet der Bericht nur `needs-human-review`; **keine automatische Produktfreigabe**. `--live-report` akzeptiert lokale frische V592-Live-Belege samt PNG-Originalen. Dateien unter `artifacts/` sind lokale Prüfresultate, keine Quellcode-Artefakte und werden nicht in der ZIP veröffentlicht.

## Offen / Grenzen

- Kein ausgeliefertes GLB-Modell: Importierte Benutzermodelle gehören nicht in eine öffentliche Quellcode-ZIP.
- Keine automatische Prüfung von Lippensynchronität oder natürlichen Bewegungen.
- Keine Playwright-Abhängigkeit, kein Paket-Download und keine Cloud- oder Spotify-API-Abfrage durch V695.
- Chromium-Test kann bei fehlendem UI, blockiertem Loopback, nicht gestarteter App oder fehlendem WebGL korrekt scheitern.
- V694-Export/Import auf realem Profil einschließlich Gerätewechsel und nicht reproduzierter historischer Probleme müssen manuell geprüft werden.
