# Sonic Display V901 – Concert Quality Intelligence 2.0

## Zweck

V901 ist ein **read-only Live-Dashboard** im vorhandenen **LIVE FX Deck**. Es macht Konflikte und fehlende Nachweise in der gemeinsamen Konzertregie sichtbar, ohne voreilig einen hypothetischen „Konzertqualitätsscore“ zu erfinden. Die Anzeige erzeugt **keine** neuen WebGL-Geometrien, Lichtquellen, Animationen, Audiosignale, Netzwerkabfragen oder selbsttätigen Show-Änderungen.

## Fünf Prüfbereiche

- **Kamera** – Ist die automatische Kameraregiefunktion für eine bestätigte V900-Szene verfügbar? Der geplante Kameratempo-Faktor wird angezeigt. Dies ist **keine gemessene Bildausschnittqualität**.
- **Lyrics** – Sind die konfigurierbaren Lyrics- und Kameraschutzschalter eingeschaltet? Die tatsächliche Lesbarkeit und Überdeckung der Worte wird nicht optisch gemessen.
- **Tänzer** – Ist die Formationskoordination mit V899 und Fußkontakt-Schutz aktiviert? Der geplante Tanzverstärkungsfaktor wird angezeigt, nicht die tatsächliche IK-/Pose-Qualität.
- **Beleuchtung** – Sind die vorhandene Spot- und LED-Koordination zugelassen? Angezeigt werden die geplanten relativen V900-Soll-Faktoren, nicht reale Luxwerte oder eine Sichtprüfung.
- **Spezialeffekte** – Sind vorhandene FX-Systeme gekoppelt? Die tatsächlich aktivierte Effektfläche oder Hardware-Auslösung wird **nicht** aus den Einstellungen abgeleitet.

**Echte Messwerte**, falls das separate V826 Concert FX Qualitätsdashboard eingeschaltet ist: FPS aus den Frame-Abständen, durchschnittliche Framezeit, P95-Framezeit und relativer V825-FX-Regeldruck. Diese Messwerte beschreiben den gerade laufenden Renderer, sind **nicht songbezogen** und sind weder GPU-Zeiten noch erfasste visuelle Bildqualität.

**Empfehlungen**, nach vorhandener Evidenz:
- Warnung bei tatsächlich erhöhten Renderer-Framezeiten, kritischer Bildrate, hohem V825-Regeldruck oder P95-Lastspitzen.
- Konfigurationshinweis, wenn bei Lyrics-Fokus der Lyrics-/Kameraschutz deaktiviert wurde oder bei aktiver Tanzregie Fußkontakt-Schutz fehlt.
- Informationshinweis bei fehlender verifizierter Songtimeline, Pausen, inaktiver Automatik oder fehlenden Live-FPS/Energiedaten.
- Absichtlich **keine** Bewertung von Bildausschnitt, echten Sängeridentitäten, Bewegungsqualität, Lyrics-Überdeckung oder WebGL-Rasterbild ohne zusätzliche echte Messverfahren.

## Benutzung

1. 3D-Bühne und **LIVE FX** öffnen; bei V901 die „Live-Regie-Diagnose anzeigen“-Option einschalten. Standardmäßig ist die Diagnose verfügbar, sie greift aber nicht steuernd ein.
2. Für die tatsächlichen Rendererwerte das vorhandene **Concert FX Studio → Concert Quality Dashboard** aktivieren (V826).
3. Eine bestätigte Songtimeline abspielen. V901 zeigt die erkannte Szene und die jeweils verfügbaren Koordinationspfade. Bei Pause, Songwechsel, Spulen ohne bestätigte Szene oder fehlender Evidenz wird ausdrücklich nicht bewertet.
4. Live-Performance, Koordinationschecks und Empfehlungen lassen sich einzeln ein-/ausblenden; V901 meldet im JSON-Export nur eine manuell angeforderte Momentaufnahme, ohne Song-/Spotify-ID.
5. **Keine neuen automatischen Einstellungen**: Abweichungen prüft und korrigiert der Nutzer im bestehenden LIVE FX Deck, Show-Timeline-Editor oder Concert FX Studio.

## Architektur und Datenhoheit

`components/visualizer/concertQualityIntelligenceV901.ts` ist pure Datenlogik. Sie vergleicht V900-Plan/Live-Cue songgebunden mit Track-ID, Dauer und Position und validiert sämtliche Rendererwerte vor einer Anzeige. `components/visualizer/ConcertQualityIntelligencePanelV901.tsx` hängt als kleines 2D-Feld im vorhandenen `LiveFxDeckV881.tsx` und abonniert den unveränderten V826-Telemetrie-Store über `useSyncExternalStore` (gewöhnlich maximal zwei Aktualisierungen pro Sekunde); es gibt keine eigene Polling-Schleife.

V901-Einstellungen liegen nur lokal in `sonic-concert-quality-intelligence-v901`, das JSON enthält die gewählte Sichtbarkeit und die auswertbare Diagnose. Die V881/V900-Voreinstellungen, V882-Signal-Bridge, automatisch/manuel gesteuerte Kamera und sämtliche 3D-FX bleiben unverändert. Die einzige erweiterte React-Deklaration befindet sich im **test-only** `tests/stubs/v881-react-jsx.d.ts`, nicht in Produktions-Typdateien.

## Prüfung

- `npm run test:v901` – robuste V901-Diagnosetests, einschließlich mehrerer Hundert Songpositionen sowie Validierung der Messwerte, Schutzschalter, Limits, Exporte und Integration.
- `npm run test:v901:types` – isolierter Kern-TypeScript-Check.
- `npm run test:v901:ui-types` – isolierter UI-TypeScript-Check mit expliziten Test-Stubs.
- `npm run verify:v901:focused` – obige Prüfungen plus V900–V880-Kette.
- `npm run typecheck` und `npm run build` bleiben für eine Produktionsfreigabe zwingend erforderlich.

Die tatsächlichen technischen Testergebnisse und unerledigten Gates stehen in `V901-VERIFICATION.md`.
