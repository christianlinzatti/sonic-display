# V918 – Intelligent Beat Prediction

**Sonic Display** – Erweiterung der V917-Bassreaktion und V911–V916-Govee-Lichtregie. **Vercel** hostet die Next.js-App; Chromium auf dem Raspberry Pi öffnet diese, während die lokale V910-Govee-Bridge unter `http://127.0.0.1:8765` läuft. Die Bridge braucht für V918 **kein Update**.

## Was V918 tatsächlich macht

Die vorhandene Mikrofonanalyse liefert BPM, BPM-Vertrauen, Beatphase, Phasenvertrauen, Phasenlock und den geschätzten Abstand zum nächsten Beat. V918 plant anhand dieser **bestätigten** Mikrofon-Informationen einen langsamen Licht-Cue kurz vor dem erwarteten Beat:

1. Prüft, dass V918 und Govee-Musiksynchronisierung aktiviert sind und das Mikrofon aktiv ist.
2. Prüft BPM/Phase, die erforderliche Konfidenz und die Aktualität des Messwerts (höchstens 750 ms alt).
3. Ermittelt den nächsten Beat-Zeitpunkt und zieht den **manuell eingestellten** Vorlauf ab.
4. Verwendet nur im Sendezeitfenster einen kleinen Helligkeitsakzent; die Farben aus V912/V913/V916, Übergänge aus V914, Rollen aus V911 und Gruppen aus V915 bleiben maßgeblich. V917-Kickakzente können parallel aktiv bleiben.
5. Sendet **mindestens 900 ms Abstand zwischen LAN-Befehlsdurchläufen**; wenn kein verlässlicher Beat erkannt wird, bleibt die bisherige Ambient-/V917-Steuerung erhalten.

**Wichtig:** Diese Funktion erkennt keine Drops oder musikalischen Songstrukturen. Sie sagt auch nicht jeden Kick eines schnellen Hardtekk-Songs voraus. Ein LAN-Befehlsdurchlauf kann vier Geräte nacheinander betreffen; die Govee-Lampen quittieren nicht den sichtbaren Lichtwechsel. Präzise Sample- oder Frame-Synchronisation ist mit dem offiziellen Ganzgeräte-LAN-Protokoll nicht garantiert.

## Einstellungen im Browser

Nach dem Vercel-Deployment unter **Einstellungen → Govee LAN → V918 Intelligent Beat Prediction**:

- **Beat-Vorhersage aktivieren:** zunächst AUS (opt-in).
- **Manueller Vorlauf:** 0–350 ms, Standard **180 ms**. Dies ist ein **Startwert**, keine automatisch gemessene Latenz. Je nach Leuchte und WLAN ist eine andere Einstellung sinnvoll.
- **Mindestvertrauen:** 60–95 %, Standard **75 %**. Bei unzureichender BPM- oder Phasensicherheit erfolgt kein prädiktiver Akzent.
- **Akzentstärke:** 0–100 %, Standard **45 %**. Der zusätzliche Lichtimpuls ist pro Rolle begrenzt, und der Maximalwert bleibt bei der Masterhelligkeit plus maximal 12 Punkten.

Die Vorschau im Editor simuliert die vier Rollen, **ohne LAN-Befehle zu senden**. Einstellungen werden lokal im Chromium-Browser gespeichert. Der bestehende Govee-Bridge-Token wird nicht exportiert oder von V918 verändert.

## Einrichtung für Raspberry Pi + Vercel

1. V910-Bridge am Pi starten und Vercel-App **im Chromium desselben Pi** öffnen. Der Browser auf einem anderen Gerät kann `127.0.0.1` des Pi nicht direkt verwenden.
2. Govee-LAN-Verbindung und ausgewählte Geräte prüfen. In Sonic Display **Govee-Lichtintegration** und **Musiksynchronisierung** aktivieren.
3. Mikrofonanalyse in den Sonic-Display-Einstellungen einschalten und Chromium gegebenenfalls Mikrofonzugriff gewähren. Ein Mikrofon am Pi muss das wiedergegebene Audiosignal erhalten; Spotify selbst liefert der Web-App keinen rohen Audiodatenstrom.
4. V918 separat einschalten. Mit dem Standard-Vorlauf beginnen und bei realer Hardware vorsichtig nachjustieren.
5. Mit verschiedenen Genres testen. Wenn BPM/Beatphase unsicher oder die Audiodaten veraltet sind, entsteht **kein vorgezogener Beat-Akzent**.

Bei pausierter Wiedergabe, unsichtbarem Browser-Tab und fehlender LAN-Verbindung bleibt die bestehende V909/V917-Schutzlogik erhalten. Manuelle Gruppenbefehle schalten die Musikautomatik ab und erhalten Priorität.

## Dateien und Tests

Neue Dateien:
- `lib/goveeBeatPredictionV918.ts` – Settings, Konfidenz/Freshness-Prüfung, Beat-Terminplanung, Befehlsrate und Helligkeits-Akzent.
- `components/GoveeBeatStudioV918.tsx` – Touchscreen-freundliche Einstellungen und Offline-Vorschau.
- `tests/v918-govee-beat-prediction-regression.cjs` – 30 Regressionstestgruppen einschließlich 4.000 reproduzierbarer Sende-Szenarien.
- `tests/tsconfig.v918-core.json`, `tests/tsconfig.v918-ui.json` und `tests/stubs/v918-audio-context.d.ts` – isolierte TypeScript-Prüfungen (Stubs nur unter `tests/`).

Integration: `components/GoveeMusicSyncV909.tsx`, `components/GoveeLanPanelV909.tsx`, `package.json`, `.github/workflows/v832-continuous-validation.yml`.

```bash
npm run test:v918
npm run test:v918:types
npm run test:v918:ui-types
npm run verify:v918:focused
```

Die bestehende vollständige CI führt zusätzlich die Produktionschecks aus. Die Versionsnummer im bestehenden `package.json` bleibt aus Kompatibilitätsgründen `0.1.0-v908`; **V918 bezeichnet den Funktionsstand**.

## Getestet / nicht getestet

- V918: 30 Testgruppen und 4.000 synthetische Beat-Planungsfälle bestanden.
- Isolierte Kern- und UI-Typechecks: bestanden.
- Fokussierte Regression V909–V917, V908 (966 Prüfungen), V907 (1.096 Prüfungen), Syntax und Architektur: bestanden.
- **Vollständiger TypeScript-Check / Next.js-Produktionsbuild: NICHT BESTÄTIGT.** `npm ci --offline` schlägt wegen fehlendem Cache-Eintrag für `zustand@5.0.16` fehl. Danach ist kein valider Next.js-Build möglich. Bitte in GitHub Actions/Vercel prüfen.
- **Echte Govee-Hardware / realer Raspberry Pi / sichtbare WLAN-Latenz:** nicht getestet.
