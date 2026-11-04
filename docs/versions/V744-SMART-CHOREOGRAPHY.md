# V744 – Smart Choreography 3.0

Basierend auf V743. V744 erweitert **nur die prozedurale Hip-Choreografie**, nicht das importierte Avatar-GLB und nicht das bestehende übergreifende Bühnen-/Kamera-System.

## Änderungen

- `components/visualizer/smartHipChoreographyV744.ts`: Phrasenbasierter Director zwischen V742 (Genre/Songabschnitt) und V738 (C1-Blend). Er kombiniert `Hip_Sway`, `Hip_Circle` und `Hip_Bounce` anhand von Genre, Songabschnitt, Beat-Position und Track-ID.
- Unterscheidet **Intro, Verse, Hook, Build-up, Drop, Break und Outro**. Bewegungsintensität ist für ruhige Abschnitte reduziert; Build-ups bekommen eine behutsame Intensitätssteigerung innerhalb der Phrase.
- Deterministische, trackgebundene Phrasenwahl mit Vermeidung direkt aufeinander folgender identischer Motive bei aktiviertem Variety-Regler. Keine zufälligen Entscheidungen pro Frame, keine neuen GLB-Clips, kein Zugriff auf Root-Positionen/IK.
- Bedienelemente unter **Einstellungen → Dance Studio → Hüftbewegungen → Smart Choreography 3.0**: aktiv, Abwechslung (0–100 %), Dynamik (0–100 %), Phrasenlänge (8 oder 16 Beats).
- Die GLB-Avatar-Vorschau verwendet denselben Director und bietet nun auch `Build-up`, `Break` und `Outro` als simulierte Songabschnitte.
- Zustand wird bei Pause, Trackwechsel, Zeit-/Seek-Sprüngen, Reduced Motion und manuell übersteuerter Bewegung zurückgesetzt. Der V738-Mixer sorgt weiterhin für weiche Übergänge.
- Einstellungen in `UiPreferencesContext` gespeichert; vorhandene Einstellungen bleiben über unveränderten Storage-Key erhalten. Die neuen Felder erhalten Defaultwerte, falls sie im alten Backup fehlen.
- `npm run test:v744`, `npm run test:v744:types` und `npm run verify:v744` ergänzt; die beiden V744-Prüfungen laufen auch vor `npm run build` im `check:fast`.

## Prioritätsregeln

1. Importierte GLB-Animationsclips, explizit gewählte Hüftbewegungen, manuelle Timelines und bestehende Motion-Overrides haben Vorrang.
2. V744 arbeitet nur bei `Auto`, wenn **V742 Genre Dance Intelligence aktiv** ist und ein Genre erkannt bzw. manuell gewählt wurde.
3. V738 mischt die prozeduralen Hüftbewegungen; V743 ergänzt echte Kick-/Bass-Reaktionen; V740/V741 und die bestehende Foot-IK bleiben nachgeordnet.
4. Ist V744 deaktiviert, läuft V742 unverändert weiter.

## Grenzen

- V744 nutzt die erkannten Songabschnitte. Sind keine verlässlichen Abschnitte bekannt, wird ein Verse-Muster verwendet; ein exakter Songstruktur-Detektor wird nicht behauptet.
- Die Preview-Songabschnitte sind manuell simuliert. Verfügbarkeit des GLB-Rigs und die tatsächliche Fußstabilität im Browser wurden hier nicht bestätigt.
- Ein natürlicher Song-Spannungsbogen entsteht hier zunächst auf der Hüft-Ebene. Eine vollständige Choreografie mit individuellen Rollen mehrerer Avatare folgt separat.

## Lokale Prüfung

```bash
npm ci
npm run verify:v744
```

Siehe `V744-VERIFICATION.md` für die bei Erstellung tatsächlich durchgeführten Prüfungen.
