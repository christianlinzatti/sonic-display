# Sonic Display V916 – Smart Light Preset Library

V916 erweitert Sonic Display V915 um eine **integrierte Bibliothek mit acht vorgefertigten, vollständig bearbeitbaren Govee-Lichtshows** für vier Genres. Der Webclient läuft weiterhin auf **Vercel**, die vorhandene **V910-LAN-Bridge** und Chromium auf dem Raspberry Pi. Für V916 sind weder neue Govee-Bridge-Endpunkte noch eine neue Pi-Installation erforderlich.

## Die acht Vorlagen

| Genre | Lichtshow | Charakter |
|---|---|---|
| Deutschrap | Nachtstadt | Dunkelrot, Violett, Blau; filmische Übergänge |
| Deutschrap | Goldene Hook | Bernstein, warmes Orange, Magenta |
| Hardtekk | Neon Rave | Intensives Cyan, Violett und Pink |
| Hardtekk | Industrial Rush | Stahlblau, kräftiges Rot und kontrollierte Drop-Akzente |
| Hardstyle | Euphoric Sky | Blau, Cyan und helle Hook-Farben |
| Hardstyle | Raw Arena | Dunkelviolett und Rot mit stärkeren Phasenkontrasten |
| Deutschrock | Rote Arena | Warme Rot-Orange-Flächen für Refrains |
| Deutschrock | Stahl & Glut | Industrial-Blau, Rot und Glutorange |

Die Vorlagen enthalten für alle **sechs V912-Songphasen** (Ambient, Verse, Hook, Build-up, Drop, Break) die RGB-Farben, Helligkeiten sowie die **V914-Übergangszeit, Übergangskurve und Lichtbewegung**. Alle acht Looks wurden als statische, nachvollziehbare Einstellungen umgesetzt – keine automatische KI-Generierung und keine neuen Behauptungen über Govee-Hardwarefunktionen.

## Bedienung

1. Die vollständige V916-ZIP in dein Sonic-Display-Projekt übernehmen und über Vercel deployen. Der Pi zeigt wie zuvor die Vercel-App in Chromium und betreibt lokal die V910-Govee-Bridge.
2. In **Einstellungen → Govee LAN** die Bridge verbinden und die gewünschten Geräte auswählen. Am besten H6063, H610B, H61A2 und H6051.
3. Zum **V912 Light Show Editor** und dort zu **V916 Smart Light Preset Library** scrollen. Mit **Genre auswählen** und **Nur Favoriten** die Vorlagen filtern. Mit **Genre-Vorschlag ansehen** einen zum aktuellen Musikgenre passenden Startvorschlag erhalten. Der Vorschlag ist keine automatische Umschaltung während der Wiedergabe.
4. Vorlage auswählen. Für die Vorschau zwischen Ambient, Verse, Hook, Build-up, Drop und Break wechseln. Die vier Kacheln zeigen die jeweiligen Leuchten, Farben, Helligkeiten und Fade-Zeiten an. Falls noch keine Leuchte ausgewählt ist, erscheinen Beispiele für die vier bekannten Modelle.
5. **Neue Show aus Vorlage erstellen** legt eine eigenständige, bearbeitbare V912-Show an. Bestehende Shows bleiben erhalten; das Limit beträgt zwölf Shows insgesamt. Die neue Show wird aus Sicherheitsgründen nicht automatisch als Live-Show aktiviert.
6. Alternativ eine bestehende Show auswählen, die Vorlage für **alle sechs Phasen** oder **nur die aktuell angezeigte Phase** in den Entwurf übernehmen und anschließend unten im Editor **Änderungen speichern** wählen. Nur ausgewählte Geräte und die gewählten Phasen werden überschrieben.
7. Vorlagen mit **☆ Als Favorit** merken; die Favoriten bleiben in diesem Browser gespeichert. Deine erzeugten Shows kannst du im unveränderten V912-Editor duplizieren, bearbeiten oder als JSON sichern.
8. Wenn die gespeicherte Show live verwendet werden soll, die bestehenden Govee-, Musik-Synchronisierungs-, V911-Regie- und V912-Show-Schalter ausdrücklich einschalten.

## Geräte und Gruppen

- **H6063**: Bühnenfarbe (`wall`), **H610B**: Rhythmus (`rhythm`), **H61A2**: Neon (`neon`), **H6051**: Ambient (`ambient`). Manuelle V911-Rollenänderungen bleiben wirksam und werden beim Erstellen einer Vorlage berücksichtigt.
- Bei aktivem **V915 Synchron-Gruppenmodus** verwenden mehrere Mitglieder weiter den gemeinsamen V911/V914-Cue der Gruppe; das individuelle Preset wird dort nur für den als Quelle gewählten Gruppen-Cue genutzt. Für individuelle Preset-Farben pro Leuchte in den Gruppenmodus **Individuell** wechseln.
- Die V914-Übergangskurven und Helligkeitsbewegungen werden vom bestehenden, separat aktivierten Musikplaner übernommen.
- Ist keine gültige Songphasenanalyse vorhanden, bleibt die bestehende V911/V914-Fallbacklogik auf **Ambient**. Es werden keine Hooks oder Drops erfunden.

## Sicherheit und Datenschutz

- Das neue V916-Modul enthält **keine Netzwerkanfragen, Govee-API-Tokens oder automatischen Ein-/Aus-Befehle**. Vorschau, Auswahl und Favoriten senden keine UDP-Befehle.
- Vorlagen erzeugen nur private IPv4-Geräte-Cues und nutzen das bestehende, streng validierte V912-Schema. Importierte V912-Shows bleiben kompatibel.
- Favoriten liegen ausschließlich im Browser (`sonic-display:govee-preset-favorites-v916`). Deine Lichtshows bleiben unter `sonic-display:govee-light-shows-v912`. Andere Browser oder Geräte brauchen die bestehende V912-JSON-Sicherung, um **Shows** zu übernehmen. Favoriten werden derzeit nicht mit der Show-Sicherung exportiert.
- Das Govee-LAN-Protokoll in dieser Implementierung steuert die **gesamte Leuchte** per RGB und Helligkeit, nicht einzelne RGBIC-Segmente oder native Govee-Szenen. Geräte-Reaktionszeiten, Latenz und WLAN-Stabilität können variieren. Für Fotosensibilität sind schnelle Blitzfolgen bewusst nicht vorgesehen.
- Die Version in `package.json` bleibt `0.1.0-v908`, weil bestehende Regressionen diese Zeichenfolge prüfen. **V916 bezeichnet den Funktionsstand**, nicht den Versionswert des npm-Pakets.

## Prüfung

```bash
npm run test:v916
npm run test:v916:types
npm run test:v916:ui-types
npm run verify:v916:focused
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

Die fokussierte Testkette prüft V916 und die älteren V909–V915-Tests sowie V907/V908, Syntax und Architektur. Der komplette TypeScript-/Next.js-Produktionsbuild muss weiterhin auf einem Rechner mit erfolgreich installierten Projekt-Abhängigkeiten (z. B. GitHub Actions) durchgeführt werden. Die tatsächlichen vier Govee-Geräte und ein Raspberry Pi standen nicht zum Test zur Verfügung.

Der zusätzliche isolierte V916-UI-Typecheck nutzt die nur in der Test-TSConfig geladenen React/JSX-Stubs; sie sind ausdrücklich **nicht** Bestandteil der produktiven `tsconfig.json`.
