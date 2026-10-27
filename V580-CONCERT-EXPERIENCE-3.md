# Sonic Display V573–V580 – Concert Experience 3.0

Stand: 26.10.2026. **Implementierte Softwareänderungen**, keine Hardware-/Produktionsfreigabe.

| Version | Ziel | Implementierung | Einschränkung |
| --- | --- | --- | --- |
| V573 | Advanced Deutschrap Lip-Sync 5 / natürliche Mimik | Nur bei bestehenden verifizierten Wörtern minimaler Brauen-/Wangen-/Augenmuskel-Akzent nach V546 | keine echten akustischen Phoneme oder Emotionserkennung |
| V574 | Eye Contact | trackgebundene und zeitlich geprüfte V528-Cues steuern vorhandene Augen-Bones | ohne Eye-Bones/ausdrückliche Rollen keine automatischen Blickbewegungen |
| V575 | Intelligent Duet 2.0 | sanfter übergebender Rückblick innerhalb V500, Clips bleiben unangetastet | explizite V416/V496-Sängerzuordnung nötig |
| V576 | Dance/Footwork 2.0 | V545 nachgelagerte kleine Fußkontakt-Dämpfung im additive Motion Pass | keine neue Mocap-Animation, IK/Foot-Lock bleibt unverändert |
| V577 | Director | langsame deterministische Variation nach V568 | kein Zufallsmodus, keine eigenständige Kamera |
| V578 | Beautiful Lyrics 9 / Stage FX | lange Zeilen mit Maximalbreite/Kontrast; neue Muster in vorhandenen Gobo-/LED-Shadern | Primärlyrics/Karaoke unverändert, keine neuen GPU-Pässe |
| V579 | Concert Quality Polish | Priorisierung von manuellen Kanälen, dichten Lyrics, Pi-Low-Tier, Regressionen/Kompatibilität | Offline-Regressionen ersetzen keinen visuellen Vergleich |
| V580 | Real Pi Benchmark / Gesamtabnahme | lokales Chromium/CDP-Benchmark mit JSON+PNG, ehrlichen FPS-/P95-rAF-Werten *wenn tatsächlich gelaufen* | hier noch keine Messung / visuelle Freigabe |

## Ausführen

Im Projektordner:

```powershell
npm run test:smoke:v580
npm run verify:v580
npm install --no-audit --no-fund
npm run typecheck
npm run build
```

Zielgerät, mit gestartetem Sonic Display (Beispiel 10-Zoll-Auflösung 1280×800):

```bash
npm run benchmark:v580:pi -- --url=http://127.0.0.1:3000/ --seconds=120 --out=artifacts/v580/pi
```

Ergebnis: `artifacts/v580/pi.json` plus `artifacts/v580/pi.png` **nur bei erfolgreicher echter Browser-Navigation und aktiver WebGL-Canvas**. Der Pi-Test verlangt Linux ARM/ARM64 und startet standardmäßig ein **sichtbares Chromium-Fenster** auf dem Pi-Display. `--headless` ist nur für eine klar als diagnostisch gekennzeichnete Messung geeignet. Auf einem Desktop darf ausschließlich `--allow-desktop` für einen **separat gekennzeichneten** Entwicklungsversuch angegeben werden. Die Kennzahlen sind Browser-rAF, nicht GPU-Frametimes oder thermische Messungen. Bei fehlenden Abhängigkeiten, blockierter Browsernavigation oder fehlender WebGL-Canvas wird ein `blocked`-JSON erzeugt, kein falscher Erfolg.

## Manuelle Abnahme (noch offen)

Zwei oder mehr echte GLBs mit separatem Mund- und Eye-Rig, Deutschrap-Song mit nachgewiesenen Wörtern und manuell zugeordneten Feature-Parts, langsamer Tanz mit Foot IK, lange Lyrics, Verse/Hook/Handoff sowie Gobo-/LED-Shadermuster jeweils mit/ohne reduzierte Bewegung prüfen. Auf Pi mindestens zwei Stunden Laufzeit, überprüfbare FPS-/Speicher-/Thermal-Kurve und stabile Touchbedienung erfassen. Erst dann kann eine Produktivfreigabe erfolgen. Die existierende V553-Freigabematrix bleibt maßgeblich.
