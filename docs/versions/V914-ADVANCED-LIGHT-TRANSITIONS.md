# Sonic Display V914 – Advanced Light Transitions

V914 erweitert den **V912 Visual Govee Light Show Editor** und **V913 Smart Color Harmony 2.0** um individuelle, sichere Licht-Überblendungen. Die neue Funktion wird ausschließlich für selbst gespeicherte und ausdrücklich aktivierte Lichtshows verwendet. Die Architektur mit **Vercel im Pi-Chromium** und der **lokalen V910 Govee-LAN-Bridge** bleibt bestehen.

## Neue Funktionen

- **Sechs Übergangskurven pro Licht-Cue:** `smooth` (Smoothstep, der bisherige Standard), `linear`, `sine`, `ease-in`, `ease-out` und `cinematic` (kurzer, sanfter Haltemoment am Anfang; keine abrupten Vollblitze).
- **Zwei optional wählbare Helligkeitsbewegungen:** `breath` (sehr langsamer neunsekündiger Verlauf, maximal 5 % Absenkung) und `lift` (maximal 4 % sanfter Akzent in der Mitte des Phasenwechsels). Die Standardoption `steady` bleibt konstant.
- **Übergangsdauer pro Leuchte und Songphase:** wie bereits in V912 einstellbar von 1,2 bis 12,0 Sekunden; die tatsächliche Hardware kann wegen LAN-Kommandotakt, Gerätereaktion und V911-Sicherheitsbegrenzungen länger brauchen.
- **Kurvengrafik im Editor:** zeigt den Verlauf samt Fortschrittsmarker. Drei Schnellpresets: Sanfte Atmosphäre, Filmischer Aufbau und Schneller Akzent.
- **Eine identische Rechenfunktion in Vorschau und Live-Steuerung:** `planGoveeAdvancedShowLookV914` berechnet RGB und Helligkeit für die V912-Lichtshow, verwendet aber die neue Überblendungskurve und den optionalen sanften Helligkeitsverlauf. Die bestehende V911-Sicherheitsbegrenzung und LAN-Ratenbegrenzung bleiben aktiv.
- **Altbestände bleiben nutzbar:** V912-Speicherformat, dieselbe Library im Browser, dieselben JSON-Export-/Importfunktionen. Vorhandene Cues ohne V914-Felder werden als `smooth` + `steady` behandelt. V913-Farbharmonie behält bei einem erneuten Harmonisieren die individuell eingestellten V914-Kurven, Bewegungen und Übergangszeiten.

## Bedienung

1. Die vollständige V914-ZIP auf Vercel deployen. Die Node.js-Bridge V910 auf dem Raspberry Pi braucht **kein Update**.
2. Sonic Display im Chromium des Raspberry Pi öffnen: **Einstellungen → Govee LAN → V912 Visual Govee Light Show Editor**.
3. Eine eigene Show laden/erstellen, eine der ausgewählten Leuchten und die Songphase **Ambient, Verse, Hook, Build-up, Drop oder Break** wählen.
4. Den Regler **Übergang**, die Auswahl **V914 Übergangskurve** und bei Bedarf **V914 Lichtbewegung** anpassen. Unter **V914 Advanced Light Transitions** Kurve und Vorschau kontrollieren; optional eines der drei Presets übernehmen.
5. Mit **Änderungen speichern** den Entwurf dauerhaft im Browser sichern. Erst dann verändert eine bereits aktivierte Show die Live-Lichtregie. Export mit **JSON exportieren** für den Gerätewechsel.

Für die tatsächliche Musikbeleuchtung sind weiterhin **Govee aktivieren**, **Zur Musik synchronisieren**, **V911 Lichtregie** und **Gespeicherte V912-Lichtshow verwenden** erforderlich. Fehlt eine bestätigte, passende Songanalyse, bleibt die Musikregie bei ihrer Ambientphase und erzeugt keinen vermeintlichen Drop.

## Modelle, Sicherheit und Einschränkungen

- Empfohlene Rollen: **H6063** Bühnenwand, **H610B** Rhythmus, **H61A2** Neon-Akzente, **H6051** Ambient. Jede Rolle kann im bestehenden V911-Panel geändert werden.
- **Nur RGB und gesamte Gerätehelligkeit** über offizielles Govee-LAN, keine Zusage für RGBIC-Einzelpixel, proprietäre Szenen oder Synchronität auf Frameebene.
- Vorschau und Showeditor haben keinerlei LAN- oder Bridge-Kommandos. Auch die neue V914-Berechnungsbibliothek enthält kein Netzwerk, keinen Storage, keine Stromsteuerung und keine Stroboskoplogik.
- Die Helligkeitsbewegungen überschreiten nie den Master-Helligkeitsregler. Min. 20 % bei aktivierter Automatik, keine automatischen abrupten Blackouts.
- `V911` sendet weiterhin höchstens etwa alle **1.700 ms** neue per-device Anweisungen (mit Rückkopplung/Begrenzung pro Tick). Die errechnete Übergangsdauer ist ein Zielwert, keine hardwaregenaue Gewährleistung.
- Die V910 Bridge bleibt an `127.0.0.1:8765` gebunden; Vercel ist nur Web-Hosting. Geräte müssen im erreichbaren WLAN sein und Govee LAN Control unterstützen.

## Tests und Freigabegrenzen

```bash
npm run test:v914
npm run test:v914:types
npm run verify:v914:focused
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

Die V914-Regression enthält 18 Testgruppen inklusive **4.000 Licht-Cue-Kombinationen**, **4.000 Helligkeitsbewegungsprüfungen**, monotone Kurven, ungültige Importfelder, Altformat-Kompatibilität, V913-Harmonie-Erhalt, identische Vorschau-/Live-Rechenfunktion und Sicherheit gegen direkte LAN-Aktionen beim Bearbeiten. Die alte V909–V913-Testsuite ist mit `verify:v914:focused` eingebunden. `prebuild` und GitHub Actions enthalten den neuen isolierten Test-/Typecheck-Schritt.

**Nicht als bestanden behauptet:** vollständiger Projekt-Typecheck und Next.js-Produktionsbuild. Beim Testen standen keine React-/Next.js-Abhängigkeiten bereit; `npm ci --offline --no-audit --no-fund --ignore-scripts` scheiterte wegen eines nicht im npm-Cache vorhandenen `zustand`-Pakets. Ein echter Raspberry-Pi-/Govee-Test muss nach Bereitstellung der Hardware durchgeführt werden. Die historische Versionszeichenfolge `0.1.0-v908` bleibt wegen bestehender Regressionstests erhalten; **V914** bezeichnet den Funktionsstand.
