# V927 – Intelligent Room Light Calibration

**Basis:** Sonic Display V926 · **Funktion implementiert:** 04.11.2026 · **Bereitstellung:** vollständiges Projektarchiv plus Funktions-/TypeScript-Prüfungen. Ein erfolgreicher vollständiger Next.js-Produktionsbuild und Hardwaremessungen sind **nicht** nachgewiesen.

## Ziel

H6063, H610B, H61A2 und H6051 können trotz gleichem Musiksignal sichtbar zu unterschiedlichen Zeitpunkten reagieren. V927 ergänzt deshalb zu V926 eine **individuelle, manuell abgleichbare Verzögerung für jede ausgewählte Govee-Leuchte**. Die zeitliche Korrektur ist standardmäßig **aus** und beeinflusst keine Leuchten, solange sie nicht ausdrücklich gespeichert und aktiviert wird.

Der eingestellte Wert gilt als **visuell beobachteter Verzögerungsausgleich**, nicht als vom Gerät bestätigte technische Messgröße. Ist eine Lampe optisch um 140 ms später, kann ihr Wellenplaner den zukünftigen Zustand um 140 ms vorausberechnen. Die Hardware sendet trotzdem nur mit der bisherigen LAN-Taktung. Es handelt sich also um eine **Wellenphasen-Korrektur**, nicht um einen framegenau vorgezogenen Netzwerk-Sendebefehl.

## Bedienung

1. In **Einstellungen → Govee LAN** deine Leuchten auswählen und – bei Bedarf – im **V926 Smart Spatial Light Director** ihre Positionen festlegen.
2. **V927 Intelligent Room Light Calibration** öffnen. Die Funktion zunächst deaktiviert lassen und über die Vorschau jede Leuchte auswählen.
3. Bei einer echten Lichtwelle (z. B. V923 Neon Flow oder V926 Raumwelle) beobachten, welche Lampe sichtbar hinterherläuft. Dazu bei Bedarf mit dem Smartphone eine Zeitlupenaufnahme machen. Im V927-Editor ihre **sichtbare Verzögerung** in 10-ms-Schritten zwischen **0 und 500 ms** einstellen. Diese Beobachtung kann der Browser nicht automatisch durchführen.
4. Optional den **globalen maximalen Vorlauf** auf einen Wert zwischen 0 und 500 ms begrenzen (Standard 350 ms).
5. Mit der integrierten Vorschau die **simulierte Songzeit** und den tatsächlich verwendeten Geräteversatz vergleichen – die Vorschau sendet **keine** LAN-Befehle.
6. Bei Bedarf die Diagnose **3× Statusantwort messen** verwenden. Voraussetzung: gültiger Bridge-Token, ausgewählte und an der Bridge registrierte Leuchte, **Auto-Sync ausgeschaltet**. Drei gezielt ausgelöste `/status`-Abfragen ergeben einen mittleren HTTP-/Bridge-Status-Roundtrip. Die Bridge wartet dabei absichtlich etwa **350 ms**; eine frische Antwort der Leuchte oder sichtbare LED-Reaktion ist damit **nicht** garantiert. Der Diagnosewert dient ausschließlich der Fehlersuche und wird **niemals** automatisch als sichtbare Verzögerung übernommen.
7. **Zeitversatz für räumliche Lichtwellen aktivieren** markieren und **Kalibrierung speichern** wählen. Nicht gespeicherte Änderungen haben keine Auswirkung auf die Live-Steuerung.
8. Für den Live-Betrieb wie bisher Govee-Integration und Musik-Auto-Sync einschalten. Bei Bedarf den optischen Vergleich mit der realen Bühne wiederholen.

## Neue Einstellungen

| Parameter | Bereich | Standard |
|---|---|---|
| `enabled` | ein/aus | aus |
| `maxAdvanceMs` | 0–500 ms, 10-ms-Schritte | 350 ms |
| `fixtures[ip].visualDelayMs` | 0–500 ms, 10-ms-Schritte | 0 ms (wenn nicht gesetzt) |
| `fixtures[ip].statusRoundtripMs` | 0–3.000 ms (nur Diagnose) | nicht vorhanden |
| `fixtures[ip].statusSamples` | 1–5 (nur Diagnose) | nicht vorhanden |

Sichere lokale Speicherung unter `sonic-display:govee-room-calibration-v927` mit Schema `govee-room-calibration-v927`. Bis zu 32 private IPv4-Adressen. Gespeichert werden keine Bridge-Tokens, keine Passwörter, keine Audioaufnahmen, kein GPS und keine Cloud-Metadaten. Die Einstellungen verbleiben im Browserprofil.

## Integration und Prioritäten

V927 integriert sich **ohne neue Bridge-Endpunkte** und ohne zusätzlichen Timer in `components/GoveeMusicSyncV909.tsx`. Die bisherige LAN-Kommandoquelle bleibt genau ein `/command`-Aufruf pro Gerät und Sendedurchlauf. V927 berechnet, solange aktiviert:

- **V922 Bass Shockwave:** `now + vorlauf` für die bestehende bereits gemessene Bass-Schockwelle. Keine erfundenen Kicks.
- **V923 Neon Pulse:** `progressMs + vorlauf` für langsame Farb- und Helligkeitswellen sowie bestehende, nur mit frischen Messdaten aktive Bass-Impulse.
- **V925 Festival FX:** Verschiebung der simulierten Songzeit **ausschließlich innerhalb desselben ausreichend sicheren, ausdrücklich beschrifteten V318-Songabschnitts**. Ein Übergang in einen künftigen, noch nicht begonnenen Drop wird **nicht** vorweggenommen. Die bestehenden V919-/V925-Vertrauensprüfungen bleiben aktiv.
- **V926 Spatial Light Director:** Verschiebung der langsamen räumlichen Wellenphase pro tatsächlich ausgewählter Leuchte. Die Raumpositionen aus V926 und die Reihenfolge bleiben unverändert.
- **V915 Groups:** Die Gruppenhelligkeit wird nach den erzeugten Lichtlooks weiterhin zuletzt begrenzt; die bereits bestehende V911-Glättung bleibt erhalten.

**Nicht Bestandteil von V927:** Ein optischer Sensor, automatische sichtbare Reaktionszeitmessung, automatisierte Echtzeit-LAN-Latenzoptimierung, millisekundengenaue LED-Kontrolle, ein eigener pro-Leuchte-Sendetimer, RGBIC-Segmentsteuerung oder eine Änderung des globalen V918-Beat-Schedulers. Netzwerk-Roundtrip und optische LED-Reaktion sind unterschiedliche Dinge. Bei der bisherigen 900-/1700-ms-Taktung können insbesondere einzelne schnelle Hardtekk-Kicks nicht präzise auf allen Geräten abgebildet werden.

## Dateien

- `lib/goveeRoomCalibrationV927.ts`: lokale Normalisierung, sichere Speicherung, Diagnoseabgrenzung, Wellenzeit-Vorlauf, verifizierter Section-Boundary-Guard und rein funktionale Vorschau.
- `components/GoveeRoomCalibrationStudioV927.tsx`: Leuchtenauswahl, manuelle optische Kalibrierung, bewusst gestartete read-only Diagnose, Entwurf, Speichern/Verwerfen, Vorschau.
- `components/GoveeMusicSyncV909.tsx`: vorhandene V922/V923/V925/V926-Planer verwenden die optionale manuelle Vorlaufzeit pro Gerät.
- `components/GoveeLanPanelV909.tsx`, `app/globals.css`: Einstellungs- und Darstellungsintegration.
- `tests/v927-govee-room-calibration-regression.cjs`: 61 Testgruppen sowie 5.000 deterministische Zustände.
- `tests/tsconfig.v927-core.json`, `tests/tsconfig.v927-ui.json`: isolierte TypeScript-Gates.
- `package.json`, `.github/workflows/v832-continuous-validation.yml`: Prebuild/CI-Gates.
- Schmale Anpassungen an Quellcode-Musterregressionen von V920/V923/V924/V926, weil diese den exakten vorherigen Variablennamen oder die alte `useEffect`-Abhängigkeitsliste erwarteten. Die Funktionsregressionen wurden danach erneut ausgeführt.

## Prüfen und deployen

`npm run test:v927` · `npm run test:v927:types` · `npm run test:v927:ui-types` · `npm run verify:v927:focused`.

Die umfangreiche `verify:v927:focused`-Kette wurde **nicht als Gesamtlauf** bestätigt; V907/V908 und alle Govee-Regressionen V909–V927 wurden einzeln gestartet und bestanden. Ein vollständiger Projekt-Typecheck und der Next.js-Produktionsbuild sind offen, da die Abhängigkeiten hier nicht vollständig verfügbar sind. **Vor Freigabe vollständige CI und `npm run build` erfolgreich abschließen sowie die tatsächliche optische Synchronität mit Pi/Leuchten beobachten.**

Die `package.json.version` bleibt aus Kompatibilitätsgründen mit historischen Regressionen auf `0.1.0-v908` – der Feature-Stand ist V927.
