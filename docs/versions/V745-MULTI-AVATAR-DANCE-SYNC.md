# V745 – Multi-Avatar Dance Sync

Ausgangspunkt: **V744 – Smart Choreography 3.0**.

## Implementiert

- Neues Modul `components/visualizer/multiAvatarHipSyncV745.ts`: songzeitbasierte Ensemble-Steuerung fuer bis zu 4 **GLB**-Performer. Die tatsaechliche Cast-Groesse wird ueber `ensembleCountV745` aus `VisualizerStage`, Duett- und Gruppenszenen weitergereicht.
- `auto`: Verse als Lead/Background-Wechsel, Build-up mit versetzten Einsaetzen, Hook/Drop gemeinsam und andere Abschnitte synchron. Alternativen: `sync`, `stagger`, `call-response`.
- Frei waehlbarer Lead-Slot (Avatar 1–4), Versatz 1/2/4 Beats, Intensitaet 0–100 %.
- Im `GltfDancerAvatarV492.tsx` wird ausschliesslich nach V742/V744 und vor dem vorhandenen V738-Posemixer gearbeitet; der V743-Audiotreiber bleibt unveraendert.
- Einstellungsfeld `Multi-Avatar Dance Sync · V745`, persistente Typdefinition und Defaultwert.
- Im `AvatarEditor.tsx` kann ein einzelner Performer-Slot aus einer simulierten 1–4er-Gruppe als Vorschau gewaehlt werden. **Das ist keine echte gleichzeitige Vier-Avatar-Vorschau.**
- Pro Avatar wird die Gain/Time-Offset-Aenderung geglaettet; der Controller schreibt niemals selbst in Knochen, GLB-Motions, Mixer-Actions oder IK.

## Grenzen und Prioritaet

- V745 greift nur ein, wenn die V744-Automatik aktiv ist, das normale Hip-Movement im Auto-Modus laeuft und mindestens zwei GLB-Avatar-Instanzen vorhanden sind.
- Statische/ausgewaehlte GLB-Motions, manuelle Timelines, Pausen, Reduced Motion und Solo-Modus werden nicht angetastet.
- Der Lead-Slot steuert die **Hüftchoreografie**, nicht die Gesangszuteilung oder Kamera.
- Vorhandene V739-Warnungen fuer fehlende Animationsclips bleiben erhalten.
- V745 erzeugt keine fehlenden Avatar-GLBs und veraendert weder die Geometrie noch die Skin-Weights; V741-Gesaessverformung bleibt optional.
- Fußkontakt und Gleitverhalten nach IK sind ohne gerendertes konkretes GLB nicht gemessen.

## Lokale Pruefung

```powershell
npm ci
npm run verify:v745
npm run typecheck
npm run build
```

Details zu den ausgefuehrten und nicht moeglichen Checks: `V745-VERIFICATION.md`.
