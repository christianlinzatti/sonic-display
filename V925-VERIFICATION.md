# V925 – Prüfbericht (04.11.2026)

**Funktion:** Festival Lighting FX Studio auf V924.
**Gesamtstatus:** V925-Testlogik, isolierte Typechecks, ältere relevante Regressionen, Syntax und Architektur **bestanden**. Vollständiger Projekt-Typecheck und Next.js-Produktionsbuild **nicht verifiziert**.

## Erfolgreich geprüft

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v925` | PASS – **52 Testgruppen**, **5.000** deterministische Muster- und Lichtzustände |
| `npm run test:v925:types` | PASS – isolierter TypeScript-Kern |
| `npm run test:v925:ui-types` | PASS – isolierter TypeScript-UI-Check |
| `npm run test:v924` und `npm run test:v920` | PASS – feste Text-Assertions an die neue zusätzliche Effekt-Ebene angepasst; jeweils 5.000 eigentliche Lichtberechnungen unverändert bestanden |
| V909–V923 Regressionstests | PASS – separat einzeln ausgeführt; V909 einschließlich real gestartetem lokalen HTTP-Testserver (Auth/CORS/PNA), **keine** echte Govee-Hardware |
| V908 Live Avatar/FX | PASS – 966 Prüfungen |
| V907 Performance Profile | PASS – 1.096 Prüfungen |
| `npm run check:syntax` | PASS – **1.357** TS/TSX-Quelldateien |
| `npm run check:architecture` | PASS – 1.103 referenzierte Codepfade |
| Dateinamen ohne Groß-/Kleinschreibungs-Kollisionen | PASS – alle Projektdateien geprüft |
| ZIP-Dateiintegrität | Separat bei Erstellung geprüft (siehe Abschlussausgabe) |

Die verschachtelte `verify:v925:focused`-Kette wurde **nicht** als ein einziger ununterbrochener Lauf nachgewiesen. Die einzelnen Prüfungen von V909 bis V925 und die wesentlichen älteren V907-/V908-Tests wurden separat ausgeführt.

## Abgesicherte Funktionsgrenzen

- V925 ist opt-in; Änderungen an bestehenden Shows, Gerätegruppen, Bridge-Tokens oder Netzwerkeinstellungen erfolgen **nicht**.
- Der Effekt läuft nur für aktuelle Track-ID und bestätigte importierte V318-/V919-Songabschnitte mit passender Phasenbezeichnung und Konfidenz. Kein künstlicher Drop.
- Die vier Muster sind deterministisch und auf ganze Leuchten statt nicht unterstützte LED-Segmente ausgelegt.
- Farbmischung maximal 35 %, Zusatzhelligkeit maximal 10 Punkte vor der V915-Gruppendimmung, danach bestehende V911-Glättung.
- Alte Lampensteuerung bleibt bei deaktivierter V925 unverändert. Ein bereits verwendeter Gruppen-Unison-Quellindex bleibt identisch für alle Gruppenmitglieder.
- Im Code existiert weiterhin genau **ein** `/command`-Sendeaufruf in der vorhandenen V909-Musiksynchronisation. V925 enthält keine eigenen LAN-Aufrufe oder Intervalle.

## Noch ausstehend

- **Vollständiger Projekt-Typecheck:** Ein Versuch mit `npm run typecheck` wurde nach 24 Sekunden zeitlich abgebrochen (kein erfolgreicher Abschluss).
- **Abhängigkeiten:** Kein vollständiges `node_modules` im Arbeitscontainer. Bereits V924 hatte bei `npm ci --offline` das fehlende Paket `zustand@5.0.16` gemeldet; ein vollständiges `npm ci` ist hier **nicht** bestätigt. Für V925 ist daher keine erfolgreiche Vollinstallation nachgewiesen.
- **Produktionsbuild:** Kein erfolgreicher vollständiger `next build` einschließlich der langen Prebuild-Testkette nachgewiesen. Die CI muss vor Deployment erfolgreich durchlaufen.
- **Hardware:** Raspberry Pi, realer Govee-LAN-Betrieb, sichtbare Farbübergänge und 3D-Bühnen-Latenz wurden **nicht** praktisch getestet.

`package.json.version` bleibt aus Kompatibilitätsgründen `0.1.0-v908`. Der Feature-Stand ist V925.
