# V921 – Cinematic Concert Light Synchronization

## Ziel

Die realen Govee-Leuchten H6063, H610B, H61A2 und H6051 begleiten dieselbe Konzertregie wie die virtuelle Sonic-Display-Bühne. V921 führt **keinen zweiten Show-Director** ein, sondern verwendet die in `ThreeAvatar.tsx` bereits ausgewerteten **V354 Show-Timeline- und V356 Automatikkonzert-Cues**, zusätzlich zum tatsächlichen Lyrics-Sichtbarkeitsstatus.

## Bedienung

1. Das vollständige V921-Projekt auf Vercel bereitstellen. Die bisherige V910-Raspberry-Pi-Bridge bleibt unverändert und benötigt keine Neuinstallation.
2. In **Einstellungen → Govee LAN** die Geräte auswählen und die vorhandene Bridge verbinden.
3. **Govee-Lichtintegration**, **Musiksynchronisierung** und **V911 Concert Light Director** einschalten.
4. Im Bereich **V921 Cinematic Concert Light Synchronization** die zusätzliche Synchronisierung aktivieren. Sie ist ab Werk AUS.
5. Kamera-, Ensemble-, Bühnenlicht- und Lyrics-Anpassung je nach Wunsch ein- oder ausschalten. Mit dem Schieberegler die begrenzte Helligkeitsänderung konfigurieren.
6. In der Offline-Vorschau eine Kameraperspektive, Formation, Bühnenlicht-Pegel und Lyrics-Sichtbarkeit wählen. Keine LAN-Befehle werden dabei gesendet.

## Live-Integration

- Der existierende 3D-Bühnenrenderer veröffentlicht höchstens alle **1,4 Sekunden** ein Track-gebundenes Show-Cue-Ereignis (`sonic-display:stage-cue-v921`). Dieses gibt die vorhandenen Bühnenentscheidungen bekannt, erzeugt aber weder eigene Kamerawechsel noch eine zweite Beat-Erkennung.
- Die Govee-Musikschleife übernimmt die Events im selben Browser-Tab und prüft vor dem Anwenden: **derselbe Track**, laufende Wiedergabe, frisches Ereignis (maximal 4 Sekunden) und eine passende Songposition. Bei Pause, Seek, Bühnen-Unmount oder fehlender Bühne wird kein V921-Effekt angewendet.
- V354-Show-Timeline hat Vorrang. V356-Szenen dürfen per Einstellung einbezogen werden, sind aber **vorläufige musikalische Show-Cues**, keine sicher nachgewiesenen zukünftigen Verse-/Hook-/Drop-Abschnitte. Ohne Timeline-Cues kann die tatsächliche Anzeige von Lyrics weiterhin einen begrenzten Lichtschutz auslösen.
- Kamera: Weitwinkel beleuchtet Bühnenwand stärker; Nahaufnahme reduziert ablenkendes Rhythmus-/Neonlicht; Orbit und mittlere Einstellungen bleiben dezent.
- Avatar-/Tanz-Formationen: Synchron-, Spiegel- und Duett-Szenen erhalten andere Lichtgewichte als Solo. Es werden ausschließlich in der Bühne aktive Formations-Cues verwendet.
- Bühne: Der vorhandene `lightGain` der V354/V356-Shows modifiziert auch die Lampenhelligkeit, begrenzt durch V921-Einstellungen.
- Lyrics: Tatsächlich angezeigte Lyrics begrenzen vor allem die Helligkeit der Rhythmus- und Neonleuchten, damit lesbare Textpassagen nicht von Raumlicht überdeckt werden.
- Die bestehenden Farben und Bühnen-Presets (V912–V916), die Farb-/Übergangslogik (V913/V914), Bass-/Beatsteuerung (V917/V918) und Songphasen-/Genredramaturgie (V919/V920) bleiben bestehen. V921 fügt ausschließlich eine geringe Helligkeitskorrektur hinzu.
- Die V915-Gruppendimmung bleibt die **letzte Helligkeitsbegrenzung** vor der vorhandenen Govee-V911-Überblendung. Es gibt **keine zusätzlichen Govee-UDP-Kommandos, Power-Flashes oder gerätespezifische RGBIC-Segmentkommandos**.

## Wichtige Einschränkungen

- V921 synchronisiert **Show-Plan-Cues**, nicht gemessene tatsächliche Kameraobjektivpositionen. Manuelle Kameraübersteuerungen behalten ihren Vorrang; nicht jede Kamerabewegung wird als Govee-Ereignis gespiegelt.
- LAN-Kommandos bleiben an die bestehende V917/V918-Befehlsrate gebunden (typisch 900 oder 1.700 ms, je nach aktiver Musiksteuerung). Dies ist eine **grobe dramaturgische Synchronisierung**, keine subframe-genaue Synchronität.
- Die vorhandene Raspberry-Pi-Bridge bleibt identisch und kann keine individuell adressierten RGBIC-Segmente ansteuern.
- Der vollständige Projekt-Typecheck und Next.js-Produktionsbuild konnten in dieser Umgebung **nicht verifiziert** werden (Projektabhängigkeiten fehlen, der vollständige `tsc`-Aufruf lief ohne Abschluss). Vor Deployment GitHub Actions/Vercel-Build prüfen.
- Physische Raspberry-Pi- und Govee-Reaktionszeiten sind noch nicht gemessen.

## Technische Dateien

- `lib/goveeConcertSyncV921.ts` – pure Cue-Normalisierung, Validierung, Planung, begrenzte Helligkeitsanpassung.
- `components/GoveeConcertSyncStudioV921.tsx` – Einstellungsbereich, Live-Signalstatus und Offline-Vorschau.
- `components/visualizer/ThreeAvatar.tsx` – sparsame Bühnen-Cue-Signalquelle aus dem tatsächlichen Bühnenplan.
- `components/GoveeMusicSyncV909.tsx` – Empfänger; Integration in die bestehende getaktete Hardware-Schleife.
- `components/GoveeLanPanelV909.tsx` – Einbindung in Einstellungen.
- `tests/v921-govee-cinematic-sync-regression.cjs`, `tests/tsconfig.v921-{core,ui}.json`, npm/CI – Regressionstests.

## Prüfkommandos

```sh
npm run test:v921
npm run test:v921:types
npm run test:v921:ui-types
npm run verify:v921:focused
npm run typecheck
npm run build
```

Der letzte Block setzt vollständig installierte npm-Abhängigkeiten und einen funktionierenden Next.js-Build voraus.
