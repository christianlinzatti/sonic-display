# V651 – Smart Preset Automation

Sonic Display kann auf Basis der **bestehenden Genre-Metadaten** eine der fünf genrebezogenen V650-Vorlagen empfehlen oder auf ausdrücklichen Wunsch bei einem **neuen Song am Anfang** anwenden. Das ist keine Spotify-Audioanalyse und keine kalibrierte Genre-Wahrscheinlichkeit. Die vorhandene Heuristik liefert nur einen Wert von 0 bis 100, der für Auto vorsichtig gefiltert wird: Trackquelle mindestens 80, Künstlerquelle mindestens 88. Manuelle Genrekorrekturen werden nicht ungefragt in ein automatisches Profil übersetzt. Genres ohne passende Werkvorlage werden nicht einfach auf Hardtekk oder Deutschrap geraten.

## Bedienung

Touchmodus → **Steuerzentrale → Profile → V651 · Intelligente Profilwahl**:
- **Aus** (Voreinstellung): keinerlei Vorschläge oder Anwendung.
- **Nur vorschlagen:** Bei ausreichend belastbarem Metadaten-Hinweis erscheint ein Profil mit „Jetzt anwenden“; ohne Tippen werden keine Einstellungen verändert.
- **Automatisch:** Pro neuem Song höchstens einmal, nur bei laufender Wiedergabe innerhalb der ersten 12 s, nach 900 ms stabiler Eingabe und ausreichendem Vertrauenswert. Einschalten während eines laufenden Songs schaltet diesen nicht um.

Manuelle Profile/Steuerungen in der Touchzentrale oder der Touch-Schnellleiste sperren weitere V651-Aktionen für den aktuellen Titel. Die letzte V651-Anwendung ist für denselben Song wiederherstellbar. Die Einstellung Aus/Vorschlag/Auto wird lokal unter `sonic-display:v651:smart-preset-mode` gespeichert. Auch bei geschlossenem Dialog bleibt die bereits eingeschaltete Automatik aktiv, solange der Touchmodus aktiv ist; bei deaktiviertem Kiosk werden keine Profile angewandt. Neu konfigurierte Vorschläge erfordern keine separaten Server-/API-Schlüssel.

## Schutzgrenzen

Nur von V650 validierte V649-Bedienparameter, V648-Kioskansicht/Lesbarkeit und ein optionales bestehendes V388-Anzeigeprofil dürfen geändert werden. Keine Sängeridentifikation, Vocal-Stems, Authentifizierung, Spotify-Wiedergabe, Text-/Lipsync-Timing, manuelle Tanz- oder Kameratimeline. Keine neuen WebGL-Pässe, GLB-Assets oder Animation-Frame-Loops. Bereits bekannte Änderungen am Bühnen-Shader können beim Anwenden eines Profils noch kurze visuelle Umschaltungen auslösen; garantierte Ruckelfreiheit wäre nicht belegt.

## Lokale Prüfung

```powershell
npm install
npm run test:v651
npm run test:v651:types
npm run test:smoke:v651
npm run verify:v651
npx tsc --noEmit
npm run build
```

In der Browserdemo mit realem Spotify-Konto und GLB-Modellen testen: automatischer Wechsel zwischen zwei ausreichend sicher klassifizierten Songs, Pause/Seek, manuelle Übersteuerung, Deaktivierung, Reaktivierung und Rückgängig. Die Offline-Regression verwendet synthetische Genre-/Zeitdaten, keine echten Last.fm- oder Spotify-Messungen.
