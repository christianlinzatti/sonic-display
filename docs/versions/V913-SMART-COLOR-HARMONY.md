# Sonic Display V913 – Smart Color Harmony 2.0

V913 ergänzt den bestehenden **V912 Visual Govee Light Show Editor** um einen lokalen, deterministischen Farbharmonie-Generator. Die neue Version basiert auf V912 mit unveränderter V910-Pi-Bridge, V909-Govee-LAN-Kommunikation und V911-Musikregie.

## Was ist neu?

- **Fünf Farbschemata:** analoge/nachbarschaftliche Farben, komplementäre Kontraste, drei harmonische Farben (Triade), geteilter Komplementärkontrast und monochrome Nuancen.
- **Hauptfarbe direkt wählbar** (`input type=color`) sowie vorgeschlagene Hauptfarben für Deutschrap, Hardtekk/Hardstyle, Deutschrock/NDH und weitere Genres. Eine Genreempfehlung wird nur auf ausdrücklichen Klick übernommen.
- **Stärke der Farbverteilung von 0 bis 100 %:** Die Berechnung lässt die Hauptfarbe als Ausgangspunkt bestehen und verteilt harmonische Farbwinkel auf die vier Lichtrollen aus V911: Bühne/H6063, Rhythmus/H610B, Neon/H61A2, Ambient/H6051.
- **Sechs Lichtphasen:** Ambient, Verse, Hook, Build-up, Drop, Break. Die Palette berücksichtigt pro Phase unterschiedliche Sättigung, Nuance und eine begrenzte Helligkeitsstufe.
- **Vorschau ohne Netzwerk:** Jede ausgewählte Leuchte bekommt eine eigene Farbkachel mit Farbe, Rolle und Helligkeit. Wechsel des Farbschemas oder der Vorschauphase verändert nie die echten Lampen.
- **Zwei explizite Aktionen:** `Farben für <Phase> übernehmen` oder `Alle sechs Phasen harmonisieren`. Beide ändern ausschließlich den **ungespeicherten V912-Show-Entwurf**. Erst `Änderungen speichern` schreibt die Show in den Browser. Andere Phasen bleiben bei Einzelphasen-Anwendung erhalten; vorhandene Übergangsdauern bleiben bestehen.
- **Weiterhin kompatibel:** gespeicherte V912-Lichtshows und ihre JSON-Sicherungen bleiben unverändert, keine Migration, keine neuen Bridge-Umgebungsvariablen oder Govee-Cloud-APIs.

## So benutzt du den Editor

1. Neue Full-ZIP auf Vercel deployen. Die V910-Bridge auf dem Pi ist weiterhin kompatibel.
2. Im Chromium des Raspberry Pi: **Einstellungen → Govee LAN → V912 Light Show Editor** öffnen. Mindestens eine Govee-LAN-Leuchte auswählen und eine eigene Show erstellen oder laden.
3. Im neuen Bereich **V913 Smart Color Harmony 2.0** Hauptfarbe, Schema, Stärke und Vorschauphase auswählen. Mit **Genre-Farbe vorschlagen** optional eine Farbe passend zur Musik übernehmen.
4. Farben nur für die aktuell im V912-Editor gewählte Phase oder für alle sechs Phasen in den lokalen Entwurf übernehmen.
5. Die gespeicherte Show erst durch **Änderungen speichern** dauerhaft aktualisieren. Über die bestehende V912-Checkbox kann sie später gezielt in der V911-Lichtregie aktiviert werden.
6. Für die echten Leuchten müssen weiterhin **Govee aktivieren**, **Zur Musik synchronisieren**, **V911 Lichtregie** und **Gespeicherte V912-Lichtshow verwenden** aktiviert sein. Der Pi muss die Bridge lokal erreichen und die betroffenen Govee-Geräte müssen LAN Control unterstützen.

## Sicherheits- und Leistungsgrenzen

- Kein Browser- oder Bridge-Netzwerkzugriff im V913-Harmonie-Modul, keine LAN-Pakete bei Vorschau oder Generator-Klick.
- Keine automatischen Ein-/Ausschaltbefehle, Blitze oder Stroboskopimpulse, keine RGBIC-Segment- oder proprietäre Szenensteuerung. Die offizielle Govee-LAN-Steuerung setzt eine einheitliche RGB-Farbe je Gerät.
- Helligkeit immer innerhalb von 20–100 % und nicht über dem globalen Master-Regler. Bestehende V911-Sanftübergänge, Polling-Ratenbegrenzung und Track-Analyse-Sicherungen bleiben unverändert.
- Die gespeicherten Shows bleiben **browserlokal** (`localStorage`) und werden weiterhin ohne Bridge-Token über V912-JSON exportiert.
- V913 ist kein kontinuierlicher Beat-/Audio-Farbregenerator: Harmonie wird bewusst beim manuellen Übernehmen berechnet und von der bestehenden Musikregie als feste Show-Cues genutzt. Das vermeidet flackerndes Neuberechnen bei jedem Beat.
- Auch mit Hosting auf Vercel rendert der Raspberry Pi die 3D-Szenen in Chromium. Bis zu einem Hardwaretest sind Verzögerungen/Performance unbekannt.

## Verifikation

```bash
npm run test:v913
npm run test:v913:types
npm run verify:v913:focused
npm run typecheck   # nach npm ci, vollständige Abhängigkeiten nötig
npm run build       # nach npm ci, vollständige Abhängigkeiten nötig
```

Die V913-Regression enthält 16 Testgruppen, unter anderem 3.000 deterministische Berechnungen, 5 Farbschemata, V912-Schema-Kompatibilität, unveränderliche Einzel-/Gesamtphasen-Updates, Helligkeitsgrenzen, Schutz gegen öffentliche Geräte-IPs und einen Prüfpunkt für rein lokale Editoraktionen. Die bestehende V912-V907-Regression ist in den fokussierten Testlauf eingebunden. `prebuild` führt V908 weiterhin zuerst aus; V913 wird zusätzlich geprüft. Die bestehende GitHub Actions CI enthält V913.

**Release-Grenze:** Eine vollständige TypeScript-/Next.js-Produktionsprüfung ist ohne installierte npm-Abhängigkeiten in der hier genutzten Umgebung nicht als bestanden nachweisbar. Reale Raspberry-Pi- und Govee-Hardware ist für den Test ebenfalls nicht verfügbar. `package.json` verbleibt bei `0.1.0-v908`, da ältere Regressionen den historischen Versionswert voraussetzen; **V913** ist der neue Feature-Stand.
