# V650 – Smart Concert Presets

In der Touch-Steuerzentrale (V649) gibt es neu den Tab **Profile**. Dort können vordefinierte Konzertprofile für **Deutschrap, Hardtekk, Hardstyle, Rock, Pop** und einen **ruhigen 10-Zoll-Lyrics-Modus** angewendet werden. Die Vorlagen ändern explizit nur die bereits von V649 erlaubten Felder wie `stageTheme`, Kamera-Modus/-Stärke, Lyrics-Schriftgröße, Ensemble-Modus, Dance-Preset, Detailintensität, Bühnenlicht, Reduced Motion und Lip-Sync-An-/Ausschalter. Sie sind **manuelle Presets**, keine behauptete automatische oder verifizierte Genreerkennung. Der tatsächlich gewählte Bühnenstil bleibt unabhängig vom genregesteuerten V647-LED-Motiv.

Bis zu **12 eigene Profile** lassen sich durch Speichern der aktuellen V649-Regler und der **V648 Touch-Ansicht/Lesbarkeit und das bestehende V388-Display-Leistungsprofil** erstellen. Eigene Profile sind lokal pro Browser-/Origin in `sonic-display:v650:concert-presets` gespeichert, strikt getrennt vom vorhandenen UI-Preferences-Schlüssel. Export und Import erfolgt als versioniertes JSON (`schema: sonic-concert-presets`, `version: 1`). Der Import wird komplett anhand der V649-Allowlist validiert, begrenzt auf 64 KiB/12 Profile und fügt nur neue IDs/Namen hinzu; bestehende Profile werden **nicht** überschrieben. Löschen benötigt eine zweite Bestätigung. Fremde Felder und ungültige Werte werden verworfen, nicht auf die Anwendung geschrieben. Bei voller Browser-Speicherung erscheint ein Fehler.

Das Anwenden erfolgt durch einen einzigen partiellen `updatePreferences()`-Aufruf plus V648 Touch-Ansicht, Lyrics-Lesbarkeit und beim eigenen Profil optional das V388-Display-Leistungsprofil. **Letzte Änderung zurück** stellt ausschließlich die vom Preset tatsächlich geänderten Einstellungen und die letzte Ansicht/Lesbarkeit/Displayprofil wieder her. Kein Schreibzugriff auf Spotify-Audio, Tokens, GLB-Dateien, einzelne Sängerslots, V644-Visemspuren, manuelle Vocal-/Kamera-/Show-Timelines oder Authentifizierung. Manuelle Regie behält ihre bereits bestehenden Prioritäten. Profile ändern vorhandene Bühnenparameter, können deshalb Render-/Shader-Umschaltungen auslösen; ein garantiert ruckelfreier Live-Wechsel wird nicht behauptet.

Neue Quellen: `components/concertPresetsV650.ts` (pure Policy), `components/ConcertPresetManagerV650.tsx` (UI), V649-Steuerzentrale und `app/globals.css` (Touch-Integration). Keine neuen Canvas/WebGL-Loops, Modelle oder externen APIs. Eigene Profile merken sich die Auswahl des **bestehenden V388-Displayprofils** (Standard/Adaptiv/Energiesparen/Schärfer); sie messen oder ändern keine Pixelauflösung und behaupten keine hardwarebasierte FPS-Kalibrierung. V388/V640 bleiben weiterhin für ihre Leistungssteuerung zuständig.

## Testen

```powershell
npm install
npm run test:v650
npm run test:v650:types
npm run test:smoke:v650
npm run verify:v650
npx tsc --noEmit
npm run build
```

Im Touchmodus „Steuerzentrale → Profile“ öffnen, sechs Vorlagen testen, „Letzte Änderung zurück“ verwenden, eigenes Profil speichern, exportieren/importieren, Löschbestätigung testen. 1024×600 und 1280×800 im echten Browser mit GLB-Avataren prüfen. Kein echter GLB-/10-Zoll-Benchmark im Offline-Regressionstest.
