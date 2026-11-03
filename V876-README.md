# Sonic Display V876 – Dynamic Festival Crowd Choreography

**Inkrementelles Upgrade**, nicht das vollständige Projekt. Die Installer und Payloads für V874, V875 und V876 sind enthalten. V876 setzt die beiden Vorgängerversionen voraus.

## Windows-Installation (PowerShell)

1. Aktuellen Projektstand zuerst in Git committen oder sichern.
2. Diese ZIP im **Projekt-Hauptverzeichnis** (mit `package.json`) entpacken.
3. Nur fehlende Versionen installieren:

```powershell
node .\apply-v874.cjs  # falls V874 noch nicht installiert ist
node .\apply-v875.cjs  # falls V875 noch nicht installiert ist
node .\apply-v876.cjs
npm ci
npm run test:v876
npm run test:v876:types
npm run typecheck
npm run build
```

Wurde V876 schon installiert, kann `node .\apply-v876.cjs` erneut ausgeführt werden: Der Installer ist auf identischer Projektbasis idempotent. Nicht erneut `apply-v874` oder `apply-v875` nach V876 laufen lassen, ohne danach auch `apply-v876` erneut auszuführen; ältere Installer erneuern ihre eigenen Rendererdateien.

Auf einer noch nicht untersuchten späteren Projektversion prüft der Installer eindeutige Integrationsstellen und bricht ab, wenn sie nicht passen. Er überschreibt keine abweichenden, bereits vorhandenen V876-Payload-Dateien.

## Funktionen

- **Sechs Crowd-Sektoren** mit synchronisierbaren, aber phasenversetzten Reaktionen; bis zu 72 virtuelle Zuschauer.
- **Seven Song-Moments:** Intro = Sway, Verse = Groove, Hook = Clap/Singalong, Build = Ripple, Drop = Bounce/Surge, Break = Ruhe, Finale = Surge. Genre-Anpassung für Deutschrap, Hardstyle, Hardtekk, Deutschrock/NDH und Pop.
- **Körper, Köpfe, Arme, Handyobjekte und virtuelle LED-Armbänder** verwenden dieselben pro Zuschauer berechneten kleinen Versätze. Keine neuen Objekte, Instanced-Mesh-Drawcalls, Timer, zusätzlichen Lichtquellen oder Audio-Dekoder.
- **FX-Studio:** Hauptschalter, sechs Sektoren synchronisieren, Stärke 0–100 %, Stil Natürlich/Konzert/Festival. Einstellungen laufen über die vorhandene Concert-FX-Konfiguration und deren Export/Backup.
- **Sicherheit/Performance:** Die Choreografie verarbeitet ausschließlich den bereits von V815/V825/V874/V875 erlaubten Crowd-Cue. Aus bei Pause, Blackout, manueller Lichtregie, reduzierter Bewegung, niedriger Qualitätsstufe und unbestätigten Musik-Cues; Lyrics und Gesang erhalten Vorrang. Zusätzliche horizontale Verschiebungen sind auf 8,5 cm begrenzt; der mittlere Bühnenbereich bleibt frei.
- **Determinismus:** Keine neue Zufallsquelle, keine eigenen Timer oder unkontrollierbare Übergänge. Bewegungen folgen vorhandener bestätigter Songphase.

## Überprüfungen (V868 + V874 + V875 + V876)

- Neue V876-Regressionstests: **19/19 bestanden**; isolierter V876-TypeScript-Check bestanden.
- Regressionen: V874 **11/11**, V875 **16/16**, V815 **15/15**, V810 **30/30**, V825 **50/50**, V868 **197/197** – bestanden (338 Tests/Testgruppen in Summe, je nach Testsuite unterschiedlich granular).
- TS/TSX-Syntax-Transpile der angepassten Dateien bestanden.
- Der Installer läuft auf frischer V868-Kopie nach V874 + V875 und lässt sich ein zweites Mal ohne weitere Dateiänderungen aufrufen. Keine Windows-Dateinamenskollisionen bei Prüfung des ausgepackten Projektbaums.
- **Nicht erfolgreich freigegeben:** Der volle `npm run typecheck` scheitert hier wegen nicht installierter Abhängigkeiten (u. a. React, Next.js, @types/node), nicht an nachgewiesenen V876-Typfehlern. Der vollständige `npm run build` wurde nicht abgeschlossen; der direkte Next.js-Aufruf scheitert an fehlendem `next`. Bitte auf dem eigenen Entwicklungsrechner oder in GitHub Actions erst `npm ci`, danach die Release-Gates ausführen.

**Integrationsbasis:** V868 ist die letzte hier greifbare vollständige Projektdatei. V873 war nicht als Gesamtarchiv verfügbar. V876 ist deshalb eine additive Erweiterung und **keine auf V873/V875 vollständig gebaute Freigabeversion**.
