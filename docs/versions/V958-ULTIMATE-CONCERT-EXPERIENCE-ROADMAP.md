# Sonic Display · V929–V958 — Ultimate Concert Experience

**Projektbasis:** hochgeladene vollständige V929 (`smart-govee-troubleshooting-assistant`).
**Stand:** integrierter V958-Entwicklungsstand, kein abgenommener Produktionsrelease.
**Wichtig:** Der vollständige TypeScript-/Next.js-Produktionsbuild ist in dieser Ausführungsumgebung **nicht grün nachgewiesen**. Siehe `reports/v931-production-gate.json`.

## Funktionsumfang und Versionszuordnung

| Version | Implementierter Stand | Einschränkung |
|---|---|---|
| V929 | Vorhandener Govee-Troubleshooting-Assistent bleibt erhalten | Bestand aus Basisarchiv |
| V930 | Begrenzter exponentieller Wiederverbindungs-Backoff, im vorhandenen Poller bzw. Versandzyklus | Keine separate Netzwerk-Watchdog-Instanz |
| V931 | Fail-closed Production Gate für Regressionen, Quellcode-Syntax, TypeScript und Next-Build; GitHub Actions Linux und Windows | Echter Produktionsbuild hier mangels installierter Module nicht abgeschlossen |
| V932 | Netzwerk-RTT und manuell gemessene optische Verzögerung separat in der Geräteansicht | Keine automatische optische Messung |
| V933 | Live-Cue-Anzeige pro Leuchte nach erfolgreicher Bridge-Antwort | Bridge-HTTP ist kein Nachweis sichtbarer LED-Ansteuerung |
| V934 | Gedimmte Wiederherstellungsszene für opt-in Auto-Sync nach Wiederverbindung | Keine Fernsteuerung bei Totalausfall; bewusst kein Einschaltbefehl |
| V935 | Fünf Rollen für Spotlight, Rhythmus, Hintergrund, Publikum, Akzente | Rollen sind Software-Prioritäten, keine modellabhängigen LED-Zonen |
| V936 | Lokale Raumaufstellungen mit expliziter Übernahme | V912-Show-Speicher bleibt unberührt |
| V937 | Konservativer Licht-Prioritätsmixer mit V912-/V354-Vorrang und begrenzten Helligkeitsänderungen | Wirkt nur bei bestätigtem Abschnitt und opt-in |
| V938 | Synthetische 12-Abschnitt-Lichtshow-Probe mit Bewertungsmodell | Rehearsal erzeugt keine Gerätebefehle |
| V939 | Gemeinsamer deterministischer Composer für Szene, LED-Wand, Kamera, Formation und Licht | Benötigt Songabschnittsanalyse für Live-Regie |
| V940 | Kamera-Cues werden nur in der vorhandenen automatischen V354-Regie überlagert | Manuelle Kamera-Cues haben Vorrang |
| V941 | Solo-/Duett-/Synchron-/Mirror-Formationen als Regie-Cues | Keine zusätzlichen Avatar-Animationen/GLB-Clips enthalten |
| V942 | Lyrics-sensible Licht- und Spotgewichtung | Keine Texterkennung oder neue Lyrics-Engine |
| V943 | Verifizierte Drop-Regie mit Virtuell-Bassimpuls und Bühnenplanung | Kein physischer Strobe-/Laserbefehl |
| V944 | Weiche, abschnittsbasierte Übergangskurven | Keine zusätzliche Postprocessing-Kette |
| V945 | Deterministische Szenenvariation über Abschnittsindex, Kamera, Formation und LED-Motiv | Kein trainiertes ML-Modell |
| V946 | Energieprofil für Verse, Hook, Build, Drop, Break und Finale | Energie wird mit vorhandenen Messwerten kombiniert |
| V947 | Deutschrap-, Hardtekk-, Hardstyle- und Deutschrock-Farb-/Regiecharakteristik | Regelbasiert, nicht generativ trainiert |
| V948 | Trackbezogener Cue-Editor: erstellen, Zeitpunkt ändern, Phase/Kamera/Formation editieren, entfernen | Kein grafisches Drag-and-drop-Schnittsystem; bestehendes V354-Studio bleibt eigenständig |
| V949 | Virtuelle transparente Lichtkegel im bestehenden R3F-Canvas | Low-poly-Approximation, kein physikalisch korrektes volumetrisches Rendering |
| V950 | Virtuelle grafische Laser-Linien | Keine Hardware-Laseransteuerung |
| V951 | Drei-dimensionale LED-Hintergrundbalken mit Equalizer-, Geometrie-, Pulse-, Starfield- und Ribbon-Motiven | Kein vollständiger LED-Video-Wall-Shader |
| V952 | Virtueller bewegter Arena-Lichtsweep | Leichtgewichtige Geometrie |
| V953 | Virtueller Bass-Impact-Ring bei bestätigtem Drop und Basswert | Kein physischer oder hardwareseitiger Full-Stage-Flash |
| V954 | Performance-arme Nebelplatten | Kein volumetrischer Partikelsimulator |
| V955 | Deterministische virtuelle Konfetti-/Luftschlangen-Geometrie | Kein umfangreicher Partikelphysik-Solver |
| V956 | Finale-Cues nur bei bestätigter Songzeit nahe dem Ende | Finale hängt von einem korrekt erkannten Trackende ab |
| V957 | Qualitätswertung für Wiederholungen, Effektüberlastung und unbestätigte Cues; zusätzlich Importanalyse realer V318-Abschnitte | Synthetische Vorschau und reale Auswertung sind eindeutig getrennt |
| V958 | Ein integriertes Studio für Regie, Lichtrollen, Raum-Presets, Cue-Timeline, Live-Monitor und R3F-FX | Hardware- und Produktionsfreigabe ausstehend |

## Architektur und Schutzmaßnahmen

- Der vorhandene Raspberry-Pi-Govee-LAN-Bridge-Pfad mit `/devices`, `/devices/add` und `/command` wird weiterverwendet. Es gibt **keinen zusätzlichen Govee-LAN-Timer**. Die eigentliche Regie besteht überwiegend aus reinen Funktionen (`lib/ultimateConcertRoadmapV958.ts`).
- Der bestehende V912-Show-Editor und explizite V354-Bühnenscores behalten Vorrang. Manuelle Avatar-/Duett-Einstellungen werden durch V958 nicht ersetzt.
- Virtuelle Laser, Nebel, Strahlen, LED-Wand und Konfetti werden nur in der vorhandenen R3F-Canvas gerendert, ohne die Hardware anzuschalten oder physische Effekte auszulösen.
- **Alle drei Schalter stehen zunächst auf aus:** Konzertregie, virtuelle 3D-Effekte, Govee-LAN-Überlagerung. Die bisherigen Einstellungen bleiben erhalten.
- Für bestätigte Verse/Hook/Drop-Übergänge ist eine zum aktuellen Track passende V318-Abschnittsanalyse mit mindestens 0,5 Confidence erforderlich. Unbestätigte Abschnitte werden nicht als bestätigte Hardware-Cues ausgegeben. Für die Probenansicht kann auch ein rein synthetischer Song verwendet werden.
- Bei fehlgeschlagenem Speichern im Browser meldet die Studioansicht den Speicherfehler; keine automatische Übernahme von Raum-/Show-Presets.

## Verwendung

1. App starten, Govee-LAN-Bereich öffnen und die bereits vorhandene Bridge-Konfiguration prüfen. Die Anzeige *Ultimate Concert Experience Studio* befindet sich unter dem Govee-Dashboard.
2. **Konzertregie aktivieren**. Zunächst den Vorschau-Slider und die 12 Szenen der synthetischen Probe ansehen.
3. Optional **Virtuelle 3D-Bühneneffekte** aktivieren und eine gültige V318-Trackanalyse importieren. Bei bestätigten Abschnitten nutzt die automatische Bühne die neuen Kamera-, Formations- und Effektvorschläge.
4. Rollen der vier Leuchten festlegen. Raumaufstellung lokal speichern; nur ein Klick auf **Preset anwenden** übernimmt gespeicherte Positionen und Rollen.
5. Govee-LAN-Überlagerung erst nach manuellen Lichttests aktivieren. Hierfür müssen zudem die vorherigen Govee-Auto-Sync-Voraussetzungen erfüllt sein. V912-/V354-Vorrang bleibt erhalten.
6. Im V948-Timeline-Editor Cues für den aktuellen Track anlegen, zeitlich und inhaltlich ändern oder löschen.

### Vercel und Raspberry Pi

Vercel stellt die Web-Anwendung bereit. Die Govee-LAN-Pakete müssen weiterhin über eine Bridge im lokalen Heimnetz versendet werden, beispielsweise über den Raspberry Pi. Die Vercel-Server können nicht direkt beliebige private LAN-IP-Adressen deiner Geräte erreichen. Browser-Permissions, HTTPS/localhost-Regeln und die bereits vorhandene lokale Bridge-Konfiguration müssen auf dem Zielgerät getestet werden. Ohne Pi und reale Leuchten ist die Hardwareanbindung hier nur softwareseitig geprüft.

## Tests und Freigabestatus

- `node tests/v958-concert-roadmap-regression.cjs` — **71 bestandene Testgruppen** (reine Regielogik, Schutzregeln, CLI-Adapter-Tests und statische UI-Integrationsprüfungen).
- `node tests/v931-build-gate-regression.cjs` — **10 bestandene Testgruppen**.
- `tsc -p tests/tsconfig.v958-core.json` — **bestanden** mit global verfügbarem TypeScript 5.8.3; prüft den reinen Composer und dessen lokale Typabhängigkeiten, nicht das ganze Projekt.
- `node tests/check-source-syntax.cjs` — **1368 TS/TSX-Dateien** erfolgreich auf Syntax und Import-Deklarationen geprüft; kein Ersatz für semantisches TS-Checking.
- Ausgewählte bestehende Regressionen **V909, V910, V911, V921, V925, V926, V927, V928 und V929** bestanden, einschließlich der jeweiligen deterministischen Stichproben.
- `node scripts/v931-production-gate.cjs` — **derzeit FAIL (korrekt)**, da `node_modules/typescript/bin/tsc` nach unvollständiger `npm ci`-Installation fehlt. Der vollständige `tsc --noEmit` und `next build` wurden daher **nicht ausgeführt** und sind **nicht nachgewiesen**. JSON-Nachweis in `reports/v931-production-gate.json`.
- Kein realer Raspberry-Pi/Govee-Gerätetest und keine fps-basierte Hardware-Qualitätsmessung durchgeführt.

### Vollständige Freigabeprüfung auf dem Entwickler-PC oder GitHub Actions

```bash
npm ci
npm run verify:v931:production
```

Erst wenn der Gate-Report `"passed": true` anzeigt, gilt die V931-Buildfreigabe. Bei einem Fehlstatus **nicht** als vollständig getestet releasen. Die Workflow-Datei `.github/workflows/v958-ultimate-concert-validation.yml` führt diese Gate-Prüfung auf Ubuntu und Windows aus.

**Kompatibilitätsnotiz:** Die bestehende `package.json`/`package-lock.json`-Version wurde wegen älterer fester Regression-Assertions nicht umnummeriert; das Projekt kennzeichnet den integrierten Stand zusätzlich durch `sonicRoadmapRelease: "v958"`. Dies ist kein Nachweis eines erfolgreichen Release-Builds.
