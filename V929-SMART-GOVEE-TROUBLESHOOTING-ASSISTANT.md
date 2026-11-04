# Sonic Display V929 – Smart Govee Troubleshooting Assistant

**Basis:** V928 Room Light Performance Dashboard (vollständiges Projekt)  
**Änderung:** Zustandsabhängiger, **rein beratender** Fehlerassistent direkt im V928-Dashboard.  
**Sprache:** Deutsch. **Standard:** ohne Aktivierung verfügbar, aber nur Lese- und Diagnosefunktion.

## Einstieg

In Sonic Display nach **Einstellungen → Govee LAN → V928 Room Light Performance Dashboard → V929 Smart Govee Troubleshooting Assistant** wechseln.

1. Bei Bedarf auf **„Bridge und Geräte jetzt aktualisieren“** klicken. Dieser Button ist die schon vorhandene V909-Aktualisierung, nicht ein neuer Hintergrund-Poller.
2. Die V929-Prioritäten und Diagnosen prüfen. **„Lösungsschritte ansehen“** öffnet konkrete, zustandsabhängige Prüfhinweise.
3. **„Zur passenden Einstellung“** springt zum vorhandenen Bridge-Token, Verbindungstest, Gerätescan, Gerätemenü, Auto-Sync, V911-Lichtregie, V912-Show-Editor bzw. V927-Kalibrierungsstudio.
4. Mit dem **Kategorie-Filter** nach Bridge, Geräten, Musik, Lichtshow und Timing filtern. Unter **„Gezielt ein Symptom untersuchen“** gibt es Prüfpfade für *Kein Licht*, *Kein Bass/Kick*, *Timingfehler* und *Hook/Drop-Show fehlt*.
5. Optional **„V929-Diagnosebericht kopieren (anonymisiert)“** verwenden. Der Bericht enthält nur Diagnosecodes, Prioritäten, Kategorien, Geräte-Laufnummern und Zähler.

## Diagnostizierte Zustände

| Bereich | Diagnose | Konkrete Hilfe |
|---|---|---|
| Bridge | Token fehlt | Token lokal per `npm run pi:token` anzeigen, in Passwortfeld übernehmen |
| Bridge | Noch nicht geprüft | Lokalen Bridge-Dienst prüfen, manuell Verbindungstest durchführen |
| Bridge | Nicht erreichbar | Raspberry-Pi-Dienst, Loopback-Adresse, Berechtigung im Pi-Chromium, Token prüfen |
| Bridge | UDP-Fehler gemeldet | Gemeinsam erreichbares LAN, Router-Isolation, Firewall, LAN-Control-Option prüfen |
| Bridge | Alte Abfrage | Manuelle Aktualisierung des bestehenden Dashboards |
| Geräte | Keine Auswahl | Geräte scannen und auswählen |
| Geräte | In Bridge nicht registriert | Erneut scannen oder private IP registrieren |
| Geräte | Länger als 90 Sekunden nicht gesehen | WLAN, Stromversorgung, LAN-Unterstützung und echte UDP-Rückmeldung prüfen |
| Geräte | Online-Angabe ohne UDP-Zeitstempel | Keine falsche Erreichbarkeit annehmen; Gerätestatus erneut prüfen |
| Musik | Integration oder Auto-Sync aus | Manuelles Einschalten in den bestehenden Reglern erläutern, nichts automatisch verändern |
| Musik | Bass-/Beatmodule aktiv | Mikrofonstatus gesondert prüfen; Dashboard kann keine Mikrofonquelle bestätigen |
| Shows | Aktivierte Show nicht gespeichert | V912-Show-Bibliothek prüfen und bewusst eine gespeicherte Show auswählen |
| Shows | V911 für aktives Modul ausgeschaltet | V911 bewusst aktivieren, bestätigte V318-Abschnitte kontrollieren |
| Timing | V927-Optikvorlauf vorhanden | Sichtbare LED-Reaktion manuell kalibrieren; HTTP/Bridge-Roundtrip ist **keine** LED-Latenz |

Bei H6063, H610B, H61A2 und H6051 erscheinen modellbezogene, bewusst bedingte Hinweise. Nicht jede Modell-/Firmwarekombination unterstützt Govee LAN Control. Ohne ein von der Bridge gemeldetes Modell lässt sich ein fehlendes Gerät nicht zweifelsfrei einer Modellbezeichnung zuordnen.

## Wichtige Sicherheit und Grenzen

- **Keine automatischen Reparaturen:** Keine Aktivierung von Auto-Sync, kein Token-Update, kein Firmwareeingriff, keine Power-/Farb-/Helligkeitsbefehle.
- **Keine zusätzlichen Netzwerkaufrufe oder Intervalle:** Wiederverwendung des V928-Snapshots; die alte V909-Bridge-Abfrage arbeitet unverändert. V929 selbst hat weder `fetch` noch `setInterval`.
- **Keine sensiblen Diagnosedaten im Export:** Token, Bridge-Adresse, IP-Adressen, individuelle Gerätnamen, Gruppennamen, räumliche Positionen und rohe UDP-Fehler werden nicht übernommen. Gerätereihenfolge wird als neutraler Index 1–N exportiert.
- **Ehrlicher Status:** „Bridge verbunden“ bestätigt keine sichtbare LED-Reaktion; eine UDP-Antwort innerhalb von 90 Sekunden ist nur ein kürzlicher Nachweis; eine aktivierte Mikrofonfunktion beweist keinen tatsächlichen Mikrofoneingang; unbestätigte V318-Songphasen erzeugen keine neuen Drops.
- **Prioritäten:** Rot/Handlungsbedarf bei fehlendem Token oder Offline-Bridge; Prüfhinweise für fehlende Geräte, Auto-Sync, Shows und V911; sonst Informationshinweise. Der Assistent ist auch bei bewusst deaktivierter Lichtsteuerung nutzbar.

## Code und Kompatibilität

- `lib/goveeTroubleshootingV929.ts` – reine Diagnosefunktion `buildGoveeTroubleshootingV929`, Symptomleitfäden und anonymisierter Report-Builder.
- `components/GoveeTroubleshootingAssistantV929.tsx` – Status, Filter, Symptomwahl, Aufklapp-Schrittfolgen, Ankerlinks, Bericht kopieren.
- `components/GoveeRoomPerformanceDashboardV928.tsx` – V929 mit vorhandener Status-Snapshot-Quelle verbunden.
- `components/GoveeLanPanelV909.tsx`, `components/GoveeLightShowEditorV912.tsx`, `components/GoveeRoomCalibrationStudioV927.tsx` – nur IDs für sprunghafte Navigation zu vorhandenen Reglern ergänzt.
- `app/globals.css` – Touch- und Tastatur-freundliche Darstellung.
- `tests/v929-govee-troubleshooting-regression.cjs`, `tests/tsconfig.v929-{core,ui}.json` – Funktionstests und isolierte TS/TSX-Prüfungen.
- `package.json` – `test:v929`, `test:v929:types`, `test:v929:ui-types`, `verify:v929:focused`, neue Gates im Prebuild. **V908 bleibt der erste Prebuild-Guard**; V928 behält seine bisherige Position.
- `.github/workflows/v832-continuous-validation.yml` – V929-Gates nach npm ci, vor V928.

### Prüfen

```bash
npm ci
npm run test:v929
npm run test:v929:types
npm run test:v929:ui-types
npm run verify:v929:focused
npm run typecheck
npm run build
```

**Aktueller Validierungsstatus:** Die neuen V929-Funktions- und isolierten TypeScript-Prüfungen sowie die älteren V907–V928-Einzeltests sind erfolgreich. Ein **vollständiger** TypeScript-Check und ein Next.js-Produktionsbuild sind hier **nicht** nachgewiesen: `npm ci --offline` scheitert am fehlenden Cache-Eintrag `zustand@5.0.16`. Vor der Freigabe müssen CI und der echte `next build` erfolgreich durchlaufen. Reale Raspberry-Pi- und Govee-Geräte wurden nicht geprüft. Einzelheiten: `V929-VERIFICATION.md`.
