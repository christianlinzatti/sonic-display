# Sonic Display V373 – Vocal Sync Inspector

**Basis:** Sonic Display V372. Projektversion `0.1.0-v373`.

## Ziel

Der V373 Inspector macht die im Vocal Performance Director verwendeten **zeitlichen Eingabedaten** und die **daraus berechneten Animationsziele** sichtbar. Er ergänzt V367–V372, ersetzt sie aber nicht. Der Schwerpunkt liegt auf einem nachvollziehbaren Zeitabgleich statt auf einer nicht vorhandenen Stimm-/Phonemanalyse.

## Benutzung

1. **Settings → Avatar & Tanz → V373 · Vocal Sync Inspector öffnen**.
2. Quelle **Aktueller Song** oder **Test-Lyrics** wählen. Der Demo-Text ist ausdrücklich als Demo markiert und wird nicht mit Spotify vermischt.
3. **Live** folgt bei realen Songs dem bestehenden Playback-Zeitstempel, der zwischen Spotify-Abfragen mithilfe von `fetchedAt` fortgeschrieben wird. **Zeitpunkt testen** arbeitet mit einem manuellen Schieberegler, ohne Spotify vorzuspulen.
4. Zeitmarken in der Nähe werden als anklickbare Wörter oder – ohne Wortmarken – als Zeile dargestellt. Ein Klick wählt den passenden Testzeitpunkt.
5. Die Pegel für **Kiefer, breite/runde Lippen, Lippenverschluss, Brauen/Mimik, Kopfakzent und Gesten** zeigen die berechneten *Zielwerte* des V372 Directors, keine gemessenen Muskeldaten und keine gespeicherte Animation.
6. Zwei Regler passen live den **Lyrics-Versatz** (ganze Textanzeige inklusive Bühnenanimation) und den **Tänzer-Versatz** (zusätzliche Verzögerung für Gesicht und Körper, nicht den eingeblendeten Text) an. Beide Versätze können gemeinsam zurückgesetzt werden.

## Herkunfts-/Timingstatus

- **Wort-Timing:** Mindestens eine gültige Wort-Zeitmarke vorhanden. Gezeigte Anzahl und Abdeckung beziehen sich auf wortgetaktete vokale Zeilen, nicht auf Qualität oder zeitliche Genauigkeit der Wörter.
- **Zeilen-Timing:** Es liegen zeitmarkierte vokale Zeilen vor, aber keine brauchbaren Wortmarken. Mundbewegung und Kopfimpulse sind bewusst schwächer.
- **Kein Sync-Timing:** Keine synchronisierten Lyrics vorhanden; es wird eine explizite Demo angeboten.
- **Pause, Instrumental, Textlücke oder Seek:** Es erscheinen neutrale bzw. ausklingende Zielwerte gemäß V372; keine erfundene Gesangsaktivität.

Instrumental-Markierungen werden von der Übersicht ausgeschlossen. Ungültige Wortmarken werden gezählt und nicht als wortgenaue Daten angezeigt. Mehrere Tänzer verwenden weiterhin die gleiche Songzeit; V371 behält subtile Gestenunterschiede je Avatar.

## Technik

- `components/visualizer/vocalSyncDiagnosticsV373.ts`: rein berechnete, testbare Timingqualität, Zeitmarkenfenster und Live-V372-Inspektion; plus separate Demo-Daten.
- `components/visualizer/VocalSyncInspectorV373.tsx`: dynamisch geladenes Client-Panel mit Spotify-Kontext, Zeitregler, Wortbuttons, Kanalpegeln und den bestehenden Timing-Einstellungen.
- `components/SettingsPanel.tsx`: lädt das Panel erst bei Bedarf.
- `app/globals.css`: responsives, barrierearm bezeichnetes Diagnose-Panel.
- `tests/v373-vocal-sync-inspector-regression.cjs`: Tests für Herkunftsdaten, gültige/ungültige Wortmarken, Pause, Wort/Zeile/Instrumental, Offset, Reduced Motion und UI-Integration.

Die Berechnung verwendet **`resolveCoordinatedVocalV372`** und die bestehende Lyrics-Zeitbasis aus `SonicDisplay.tsx`. Es gibt keine zusätzlichen Netzwerkanfragen, keinen Audio-Upload, keine zusätzlichen WebGL-Szenen und keine dauerhafte Hintergrundanalyse.

## Prüfung

- `npm run check:syntax` – bestanden (497 TS/TSX-Dateien).
- `npm run test:v373` – bestanden.
- `npm run test:v367` bis `npm run test:v372` – bestanden.
- Zusätzlich 32/32 ausgewählte Regressionstests (u. a. V350–V373, Multi-Avatar und Runtime) – bestanden.
- `npm run build:preflight` – meldet weiterhin fehlendes `package-lock.json` und 16 von 17 npm-Abhängigkeiten. Damit sind `npm run typecheck` und `npm run build` **in dieser Offline-Umgebung nicht verlässlich testbar**; Syntax-/Regressionstests sind kein Ersatz für den vollständigen Production-Build.

Nach dem Entpacken auf einem Rechner mit Netzwerkzugang:

```bash
npm install
npm run verify
```

## Wichtige Einschränkungen

Weder Lyrics-Wortmarken noch die V368-Klangerzeugungsheuristik erkennen echte gesungene Phoneme, getrennte Sängerstimmen oder die faktische Synchronität einer GLB-Mundbewegung zum Audio. Der Inspector zeigt **nur Timingabdeckung und geschätzte Zielparameter**. Ein Avatar benötigt weiterhin geeignete Morph-Targets oder ein Kiefer-Rig, damit die berechneten Parameter sichtbar werden.
