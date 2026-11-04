# V928 – Room Light Performance Dashboard

**Basis:** vollständige V927-Version · **Implementiert:** 04.11.2026 · **Status:** fokussierte Tests bestanden; kompletter Next.js-Produktionsbuild und Live-Hardwarebetrieb nicht verifiziert.

## Ziel und Bedienung

Unter **Einstellungen → Govee LAN → V928 Room Light Performance Dashboard** befindet sich jetzt ein **rein lesendes Diagnose-Dashboard** oberhalb der Gerätegruppen und der anderen Light-Studios. Es ergänzt die bestehende Bridge-Bedienoberfläche und verwendet deren vorhandene Statusdaten.

**Übersicht:** Bridge verbunden/getrennt/nicht geprüft/Status veraltet, Zeitpunkt der letzten erfolgreichen gemeinsamen `/health`- und `/devices`-Abfrage, kürzlich gesehene ausgewählte Leuchten, Anzahl eingeschalteter Lichtmodule sowie Anzahl Module mit konfigurierten Voraussetzungen. Das bedeutet nicht, dass tatsächlich Lichtbefehle ausgegeben werden oder dass Musik läuft.

**Pro ausgewähltem Gerät:** Modell, Geräte-IP (nur in der privaten UI), gewählte Lichtrolle, zuletzt bestätigte UDP-Antwort, aktive V915-Gruppe und Gruppendimmung, aktiver manuell eingestellter V927-Lichtzeitversatz, ggf. diagnostizierter HTTP-Status-Roundtrip und explizit gespeicherte V926-Raumposition. Der Roundtrip ist **keine** optische LED-Reaktionszeit.

**Lichtmodule:** Aufklappbare Modulübersicht für V911, V912, V915 sowie V917–V927 mit getrennten Kennzeichnungen für **eingeschaltet** und **Voraussetzungen konfiguriert**. Für V919, V920 und V924 gehört die V911-Lichtregie zu den Voraussetzungen. Eine ausgewählte V912-Lichtshow muss gespeichert sein. Auch wenn die Konfiguration vollständig ist, können Mikrofon, Songdaten, Playback oder Hardware zur Laufzeit fehlen.

**Status aktualisieren:** Button „Bridge und Geräte jetzt aktualisieren“ verwendet die **bereits existierende** `refresh()`-Funktion des V909-Panels mit `/health` und `/devices`. Nach der ersten bewusst ausgeführten Verbindungskontrolle gilt außerdem der vorhandene 12-Sekunden-Poll des Panels – **kein zusätzlicher Netzwerktimer**. V928 sendet selbst **keine** `/command`-, Power-, Farb- oder Helligkeitsbefehle.

**Diagnosebericht:** Button „Diagnosebericht kopieren (ohne sensible Daten)“ erstellt einen JSON-Schnappschuss mit Version, Erstellzeit, anonymisierten Gerätereihen und Modulbereitschaft. Der kopierte Bericht enthält absichtlich **keinen Bridge-Token, keine Bridge-Adresse, keine Geräte-IPs, keine Geräteenamen, keine Gruppennamen und keine Raumkoordinaten**. Er wird nicht automatisch hochgeladen, gespeichert oder an externe Dienste übertragen.

## Wichtige Grenzen

- Die V910-Bridge setzt `online` auf Basis einer empfangenen UDP-Antwort innerhalb von **90 Sekunden**. Das ist nur **„kürzlich gesehen“**, kein garantierter aktuelle Erreichbarkeitstest, keine Gerätelaufzeitmessung und keine Bestätigung eines Lichtbefehls.
- Hat das Panel in über **30 Sekunden** keine vollständige neue Statusabfrage erhalten, wird der komplette Status als **veraltet** gekennzeichnet und es werden keine Leuchten als aktuell bestätigt gezählt. Bei getrennter Bridge werden keine Geräte als erreichbar dargestellt.
- Manuell hinzugefügte Leuchten ohne bestätigte Antwort werden **nicht** als erreichbar ausgegeben. Fehlende Registrierung in der Bridge wird gesondert angezeigt.
- Ein konfiguriertes Lichtmodul bedeutet **nicht**, dass der Effekt aktuell läuft oder dass ein bestätigter Verse-/Hook-/Drop-Cue bzw. aktive Mikrofonmesswerte vorhanden sind.
- Die V927-Netzwerkdiagnose bleibt eine separate, nur manuell ausgelöste Funktion und ist nicht Teil automatischer Dashboard-Abfragen.
- Das Dashboard beeinflusst weder die V915-Gruppendimmung noch die Lichtplanung aus V911–V927. Es verändert keine bestehenden gespeicherten Einstellungen und aktiviert keine Funktion automatisch.

## Neue und geänderte Dateien

- `lib/goveeRoomDashboardV928.ts`: rein funktionales, seiteneffektfreies Statusmodell, Sicherheitsregeln für veraltete/fehlende Antworten, Bereitschaftsberechnung und anonymisierter Diagnosebericht.
- `components/GoveeRoomPerformanceDashboardV928.tsx`: zugängliche Statuskarten, Warnhinweise, Gerätekarten, Modulübersicht, vorhandene Bridge-Refresh-Aktion, Clipboard-Diagnose.
- `components/GoveeLanPanelV909.tsx`: Einbindung des Dashboards nach den Haupt-Verbindungsinformationen; Zeiterfassung nach erfolgreich abgeschlossener `/health`+`/devices`-Abfrage.
- `app/globals.css`: responsive Dashboard-Darstellung.
- `tests/v928-govee-room-performance-regression.cjs`: 58 Testgruppen und 5.000 deterministische Gerätestatus-Simulationen.
- `tests/tsconfig.v928-core.json` und `tests/tsconfig.v928-ui.json`: isolierte TypeScript-Prüfungen.
- `tests/v927-govee-room-calibration-regression.cjs`: Kompatibilitäts-Guard toleriert V928 nach dem weiterhin **ersten** V908-Sicherheitscheck.
- `package.json` und `.github/workflows/v832-continuous-validation.yml`: CI und Prebuild berücksichtigen V928.

## Verifizieren

```bash
npm run test:v928
npm run test:v928:types
npm run test:v928:ui-types
npm run verify:v928:focused
npm run test:module-case
npm run check:syntax
npm run check:architecture
```

Die einzelnen V907/V908- und V909–V927-Funktionstests wurden separat ausgeführt; nicht behaupten, dass die vollständige verkettete `verify:v928:focused`-Folge oder der Produktionsbuild erfolgreich durchlief. Der vollständige Projekt-Typecheck wurde hier nach einem Zeitlimit abgebrochen; der lokale npm-Cache enthält `zustand@5.0.16` nicht. **Vor Deployment `npm ci`, vollständigen TypeScript-Check und `npm run build` in CI erfolgreich nachweisen.** Hardwaretests mit Govee H6063, H610B, H61A2 und H6051 sowie Raspberry Pi sind weiterhin offen.

`package.json.version` bleibt aufgrund alter Regressionen bei `0.1.0-v908`, der Feature-Stand ist **V928**.
