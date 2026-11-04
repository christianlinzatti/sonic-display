# V829 – Ultimate Concert Experience: Implementierung und Abnahme

**Status:** Integrierter und mit synthetischen Prüfdaten regressionstesteter Quellcode-Stand. **Keine produktive Freigabe**, keine echte 3D-/GPU-Gesamtabnahme.

## Implementiert

1. Neue `concertAcceptanceV829.ts`-Erfassung mit neun Fällen: Deutschrap, Hardtekk und Deutschrock mit je 1, 2 und 4 **konfigurierten** Performern. Die drei Genres kommen ausschließlich aus der normalisierten, bestätigten V810-Konzertregie. Andere Genres werden in dieser Matrix nicht als erfolgreiche Abnahme fehlinterpretiert.
2. V826 liefert bei laufender Live-Hauptbühne etwa alle 0,5 s aktuelle Framezeiten, FPS, P95-Fenster, relative FX-Drosselung, Renderer-Info-Snapshots und aktive Schaumbzw. Partikel-Sollinstanzen. V829 lauscht **nur** auf diesen abgeschlossenen Messfenstern; keine eigenen Renderer, neuen Renderflächen, Worker oder Timer.
3. Pro Fall muss derselbe Song nahezu vollständig vom Anfang bis zum Ende gespielt werden. Mindestens zwei verifizierte Songabschnitte, echte kumulierte Renderzeit von wenigstens 78 % der Songlänge und ein Start nahe dem Songanfang sind erforderlich. Songwechsel, Wechsel des Qualitätsprofils, der Songdauer, Zurückspringen, Vorspulen und größere Messlücken brechen den aktiven Lauf ab. Dadurch können keine einzelnen Test-Frames als Gesamtabnahme gelten.
4. Im Concert FX Studio gibt es die Matrix mit Start/Stopp pro Fall und explizit **manuellen** Entscheidungen für Lyrics-Lesbarkeit, Vocal-/Lip-Sync, Kamera/Framing, Choreografie/Formation, Bühnen-FX sowie Übergänge/Dramaturgie. Ein schlechter manueller Wert verhindert 'Bestanden'. Die Anzeige gibt einen Live-FPS-/Langsamframe-Schwellenhinweis und erlaubt den Export aller neun Fallstände als lokales JSON.
5. Genreinterne 1-/2-/4-Personen-Vergleiche werden nur bei gleichem Track, Profil und Songlänge als technisch vergleichbar markiert. Displayauflösung, tatsächliche GLB-Meshes und Modellkomplexität bleiben **manuell** zu überprüfen.
6. Bestehende manuelle V823-Timeline, Auto-Regie V824/V828, V825-Performance-Budget, V827-Automatik, Blackouts, Lyrics- und Performer-Schutz werden **nicht** verändert.

## Tatsächlich ausgeführte technische Prüfungen

- `npm run test:v829`: **PASS, 58 Testgruppen**, darunter neun kombinierte Akzeptanzfälle mit simulierten `V826`-Messfenstern, Zeit-/Seek-Grenzen, Genre-/Besetzungswechsel, vollständige Songabdeckung, fehlende oder negative manuelle Prüfungen und JSON-Berichtsstruktur. **Die simulierten Testfälle sind keine realen Konzerte.**
- `npm run test:v829:types`: **PASS** – isolierter strenger TypeScript-Check für die V829-Domänenlogik.
- `npm run check:syntax`: **PASS** – 2.390 TS/TSX-Dateien bzw. Bindungen.
- `npm run check:architecture`: **PASS** – 912 verifizierte Codeverweise.
- Regressionen `npm run test:v800` bis `npm run test:v828`: **PASS** – 29 historische Suiten, alle einzeln abgeschlossen. Nur feste Erwartungen an die neue Versionsnummer/den Prefix der Build-Testkette wurden in den entsprechenden älteren Tests erweitert; keine fachlichen Schranken wurden entfernt.
- `package.json` / `package-lock.json` auf `0.1.0-v829` aktualisiert; `test:v829` und isolierte V829-Typprüfung vor die bestehenden Testketten in `check:fast`, `check:release` und `build:preflight` gestellt.

## Offene, NICHT bestätigte Freigabebedingungen

- **Gesamtprojekt-TypeScript:** `npm run typecheck` wurde gestartet; innerhalb der Laufzeitbeschränkung lag kein abgeschlossenes Ergebnis vor. Weder Erfolg noch Fehlerfreiheit bestätigt.
- **Next.js-Produktion:** `node_modules/.bin/next` und installierte `next`-Abhängigkeit sind in der Ausführungsumgebung nicht vorhanden. Ein erfolgreicher `next build` ist **nicht** belegt.
- **Browser-/GPU-/Hardwaretests:** Keiner der neun geführten Live-Konzerte wurde in dieser Umgebung ausgeführt. Keine reale GPU-Zeit, kein Nachweis tatsächlicher GLB-Meshes, keine audiovisuelle Validierung von Lip-Sync, Kamerabild oder Lyrics. Zu Testzwecken erzeugte Fixture-Daten sind **keine** echten Resultate.
- **Abnahmeschwellen:** Die 80%-Fps-/30%-Slowframe-Schwellen sind vorsichtige, transparente Prüfkriterien und ersetzen keine subjektive Sicht- und Qualitätssichtung.
- Die Testfälle zählen konfigurierte Performer-Slots, nicht tatsächlich gerenderte GLB-SkinnedMeshes. Für eine Hardwareempfehlung sind echte Messungen auf demselben Gerät mit gleicher Auflösung/GLB-Komplexität und eine separate Zielhardware-Messung erforderlich.

## Lokale Freigabeschritte

```powershell
npm ci
npm run test:v829
npm run test:v829:types
npm run typecheck
npm run build
```

Danach im Concert FX Studio unter **V829 · Gesamtabnahme** jeweils einen echten Song mit Genre Deutschrap, Hardtekk oder Deutschrock und 1, 2 oder 4 tatsächlich sichtbaren und geladenen GLB-Avataren vom Anfang bis zum Ende abspielen. Gleiche Zielauflösung, Effekte und Geräteprofil verwenden. Lippen, Lyrics, Kameraführung, Tänzer und FX während der Wiedergabe beurteilen. Alle neun Fälle mit überprüftem Live-Benchmark und manuellem Review im JSON exportieren. **Erst danach** darf eine produktive Abnahme erwogen werden.
