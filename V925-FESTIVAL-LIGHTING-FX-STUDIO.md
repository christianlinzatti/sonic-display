# V925 – Festival Lighting FX Studio

**Basis:** Sonic Display V924 Intelligent Light Energy Director · **Funktionsstand:** 04.11.2026

V925 erweitert die bestehende Govee-Konzertlichtregie um kontrollierte, genreabhängige Lichtbewegungen **über ganze Leuchten**. Vorhandene V912-Shows, V913-Farbharmonien, V914-Übergänge, V915-Gerätegruppen und V916-Presets werden **nicht umgeschrieben**. Wie alle neueren Govee-Zusätze ist V925 standardmäßig deaktiviert.

## Vier Festival-Effekte

- **Arena Sweep:** Eine breite, langsam wandernde Lichtwelle durch die ausgewählten Leuchten, mit wechselnder Richtung zwischen Abschnitten.
- **Symmetric Wave:** Spiegelbildliche Bewegung von der Gerätemitte zu den äußeren Leuchten (und zurück).
- **Color Front:** Eine langsame, an die Musikrichtung angepasste Farbfront über die **gesamten** Govee-Geräte. Keine RGBIC-Pixel- oder Segment-Steuerung.
- **Drop Finale:** Pro **bestätigtem** Drop ein zeitlich begrenzter, sanfter Lichtscheitel – mit begrenztem Farb- und Helligkeitsaufschlag, nicht mit einem Blitz/Stroboskop.

Der **Auto-Modus** wählt den Stil nach der bereits bestätigten Songphase: wiederkehrende Hooks abwechselnd Arena/Farbfront, Build-up symmetrisch, Drop zunächst Finale und danach Farbfront. Verse und Breaks bleiben von V925 bewusst unbeeinflusst. Die bisherigen Lichteffekte dieser Phasen arbeiten weiter.

Die Farbpaletten sind auf **Deutschrap**, **Hardtekk**, **Hardstyle** und **Deutschrock/NDH** abgestimmt. V925 mischt die Farben nur sanft zum aktuellen Live-Look; bestehende Showfarben bleiben der Ausgangspunkt.

## Bedienung

1. Unter **Einstellungen → Govee LAN** die Verbindung zur lokalen Raspberry-Pi-V910-Bridge konfigurieren und die gewünschten Geräte auswählen.
2. **Govee-Lichtintegration**, **Musiksynchronisierung**, die **V911-Konzertlichtregie** und den **V919 Verse Hook Drop Lighting Director** aktivieren.
3. Für den aktuell abgespielten Track müssen gültige V318-Songabschnitte mit genügend hoher Konfidenz vorliegen. Ohne diese Signale werden keine V925-FX erzeugt.
4. **V925 Festival Lighting FX Studio** öffnen und den neuen Schalter separat aktivieren. Muster wählen: Auto, Arena Sweep, Symmetric Wave, Color Front oder Drop Finale.
5. **Stärke** (0–100 %), **Farbmischung** (0–35 %), **maximalen Helligkeitsakzent** (0–10 Punkte), **Wellenperiode** (2,5–12 s), **Geräteversatz** (150–1600 ms) und **Mindest-Konfidenz** (50–95 %) anpassen.
6. In der **lokalen Vorschau** Genre, Songphase und Phasezeit einstellen. Die dort gezeigten Abschnittsdaten sind ausdrücklich **synthetisch**; es werden **keine** Hardwarebefehle gesendet.

## Integration und Schutzmaßnahmen

- **Bestätigte Songphasen:** V925 prüft die exakte Track-ID, eine gültige Songposition, den tatsächlich aktiven V318-Abschnitt, die Mindest-Konfidenz und die identische V919-Phasenentscheidung. Ohne Übereinstimmung liefert es eine inaktive Entscheidung. Erfundene Drops sind ausgeschlossen.
- **Begrenzte Lampenwirkung:** Maximal 35 % Farbmischung, maximal 10 zusätzliche Helligkeitspunkte *vor* der V915-Gruppendimmung. Der vorhandene V911-Smoother begrenzt die Farb- und Helligkeitsänderung je Sendedurchlauf.
- **Gruppen:** In V915-Unison-Gruppen verwendet V925 dieselbe Quelle und denselben Index für alle Mitglieder, damit ihre Festival-Wellen nicht auseinanderlaufen. Die tatsächliche Gruppendimmung wird **zuletzt vor der V911-Glättung** auf die berechneten Zielwerte angewandt.
- **Kein zusätzliches Netzwerktrafikmodell:** V925 läuft innerhalb des vorhandenen V909-Sendepfads; keine neuen LAN-Endpunkte, Timer, Stromsteuerung, Geräteerkennung, Mikrofonaktivierung oder gespeicherten Authentifizierungsdaten.
- **Keine hardwaregenauen Segmente:** Die vorhandene Bridge steuert ganze Lampen mit RGB/Helligkeit. V925 kann auf einer einzelnen H61A2 **keinen** mehrfarbigen RGBIC-Streifen segmentweise durchlaufen lassen. Dafür wäre eine gesonderte, hardwareabhängige Steuerung erforderlich.
- **Kamera und virtuelle Bühne:** Die bereits vorhandene V921-Kopplung an Bühnen-Cues bleibt erhalten. Die neuen V925-Muster folgen bestätigten Songabschnitten; eine framegenaue räumliche Kopplung an den virtuellen 3D-FX-Renderer ist **nicht** implementiert oder hardwareverifiziert.

## Wichtige Dateien

- `lib/goveeFestivalFxV925.ts` – Optionsvalidierung, Browser-Lokalspeicher, Genre-Farbpaletten, pure Musterberechnung, Look-Overlay und künstliche Vorschau.
- `components/GoveeFestivalFxStudioV925.tsx` – Touch-geeigneter Editor mit Schaltern, Parametern, Live-Status und vier Geräte-Vorschaukarten.
- `components/GoveeMusicSyncV909.tsx` – Integration in den **einen** vorhandenen LAN-Sendedurchlauf; alle bestehenden Effekte und V915-Vorgaben bleiben erhalten.
- `components/GoveeLanPanelV909.tsx` und `app/globals.css` – neues Einstellungsfeld und Styles.
- `tests/v925-govee-festival-fx-regression.cjs` – 52 Testgruppen und 5.000 deterministische Effektzustände.
- `tests/tsconfig.v925-{core,ui}.json` – getrennte TypeScript-Kern- und UI-Prüfungen.
- `.github/workflows/v832-continuous-validation.yml` und `package.json` – CI-Prüfschritt und neue npm-Kommandos.

## Lokale Tests

```bash
npm run test:v925
npm run test:v925:types
npm run test:v925:ui-types
npm run verify:v925:focused
npm run check:syntax
npm run check:architecture
npm ci
npm run typecheck
npm run build
```

**Hinweis:** Der gesamte npm-Abhängigkeitsbaum war im aktuellen Arbeitscontainer nicht installiert. Die vollständigen Projekt-TypeScript- und Next.js-Produktionsbuilds sind daher **nicht verifiziert**; ein isolierter Typecheck ersetzt diese nicht. Vor produktivem Einsatz müssen `npm ci`, der vollständige `typecheck`, der `build` und die GitHub-CI erfolgreich sein. Die tatsächliche Hardwarewirkung, Latenz und die Möglichkeit schneller Effekte mit Govee LAN sind erst mit den vier echten Leuchten am Raspberry Pi zu messen. `package.json.version` bleibt wegen älterer Release-Guards absichtlich `0.1.0-v908`; V925 bezeichnet die neue Funktionsstufe.
