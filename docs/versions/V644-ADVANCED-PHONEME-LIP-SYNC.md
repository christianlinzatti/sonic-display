# Sonic Display V644 – Advanced Phoneme Lip-Sync

## Implementiert

- In den Einstellungen direkt neben V643: **V644 Visem-Timeline**. Der Nutzer
  markiert die Start-/Endzeit (Millisekunden), einen von vier Avataren und
  die Mundform `sil`, `PP`, `FF`, `TH`, `AA`, `E`, `IH`, `OH` oder `OU`.
- Import/Export einer streng validierten, versionierten JSON-Spur. Kein
  Audioexport, keine Phonem- oder Liedtext-Inhalte, kein Netzverkehr.
- Standardzustand **deaktiviert**. Erst nach ausdrücklicher Aktivierung
  beeinflussen die Markierungen die vorhandene V368-GLB-Gesichtsregie.
- Die Live-Regie prüft Song-ID, Avatar-Slot, Pause, Zeitbereich und explizites
  Opt-in; nach Songwechsel oder dem Entfernen der Oberfläche wird die Spur
  aus dem Speicher entfernt.
- An zwei direkt angrenzenden manuellen Intervallen erfolgt ein kurzer,
  höchstens 40-ms langer Übergang. Verschlüsse wie B/P/M halten die
  Kieferöffnung begrenzt. Im bereits bestehenden useFrame folgt die
  reguläre V631-Face-Glättung; kein neuer Renderloop.
- Beim Fehlen autorisierter Daten wird weiterhin die vorhandene automatische
  getaktete Lyrics-/Rap-Regie verwendet. Demovorschau, authored Motion-Clips
  sowie explizite Silben-/Audio-Prioritäten bleiben vor V644.
- Importverifikation: höchstens 4.000 manuelle Zeitintervalle, höchstens
  zwölf Minuten, halb-offene und je Sänger nicht überlappende Bereiche,
  exakt zulässige Visemwerte. Track-/Songlängenabgleich. Ein per Slot
  vorindizierter Array ermöglicht Laufzeit-Abfragen in O(log N).

## Wichtige Grenzen

**V643 schätzt keine Phoneme.** V644 stellt keine neue akustische
Spracherkennung oder automatische Forced Alignment Pipeline bereit. Die
Nutzerzuordnung eines Mundbildes ist kein Nachweis einer korrekt isolierten
Gesangsspur oder Sängeridentität. Die vorhandene Lippenbewegung basiert
weiterhin auf den getakteten Lyrics und manuell gesetzten Ergänzungen.
Die Genauigkeit muss an echten GLB-Rigs und Referenzvocals visuell geprüft
werden; nur unterstützte Morph-Targets können animiert werden.
Das Voransichts-Songzeitmaß folgt der bestehenden Lip-Sync-Uhr (mit den
bisher eingestellten Lyrics-Timingkorrekturen).

## Implementierung

- `components/visualizer/phonemeLipSyncV644.ts` – Validator, Presets, O(log N)
  Runtime-Abtastung und flüchtiger Opt-in Speicher.
- `components/visualizer/PhonemeTimelineLabV644.tsx` – manueller Editor.
- `components/visualizer/VocalRigV368.tsx` – Integration innerhalb des
  bestehenden Frame-Callbacks, vor Morph-Überlagerung.
- `components/SettingsPanel.tsx` – dynamisch geladener Editor.
- `tests/v644-phoneme-lip-sync-regression.cjs` und Kern-Typecheck.

## Windows-Nachprüfung

```powershell
npm install
npm run test:smoke:v644
npm run verify:v644
npx tsc --noEmit
npm run build
```

Statische Tests und Simulation sind **keine** optische Abnahme und kein
Beweis für einen vollständigen Next.js-Produktionsbuild.
