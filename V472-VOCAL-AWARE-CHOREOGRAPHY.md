# Sonic Display V472 — Vocal-Aware Choreography

## Ziel

Deutschrap-Avatare erhalten feine, additive Gesten zu **zeitgestempelten Lyrics-Zeilen und Wörtern**. Bei bekannten, vom Nutzer zugewiesenen Feature-/Duett-Rollen werden Gesten je Avatar verstärkt oder zurückgenommen. Die bestehende V471-Genre-Fusion und alle Tanz-, Lippen- und Kamerasysteme bleiben erhalten.

## Integration

- `components/visualizer/vocalAwareChoreographyV472.ts` erzeugt deterministische, zeitgebundene Zeilen- und Wortakzente. Läuft ohne Audio-/React-Abhängigkeiten; Songabschnitt Hook/Verse beeinflusst die Stärke. Textformatierung wie `!`, `?` oder durchgehend großgeschriebene Wörter sind **lediglich schwache Ausdrucks-Hinweise** und kein erkannter Sprechakzent.
- `hooks/useAudioMotionEngine.ts` ergänzt sanft gedämpfte Winkel für Oberkörper/Arme zur unveränderten GLB-Basisanimation. Kein Eingriff in Lip-Sync-Gesichtsrig, gespeicherte Mixer-Clips, Foot-IK oder Avatar-Dateien.
- `components/visualizer/ThreeAvatar.tsx` aktiviert die neue Schicht sowohl für importierte GLB-Avatare als auch für den prozeduralen Fallback. Vorhandene V385- und V416-Zuordnungen werden nur bei passender Track-ID verwendet; ohne Zuordnung gibt es keinen vermeintlich erkannten Sängerwechsel. Andere Genres behalten ihre V471-Choreografie.
- Bestehende Einstellungen `avatarVocalBodyEnabledV371`, `avatarVocalGesturesV371`, `avatarVocalBodyStrengthV371`, Audio-Motion V468 und Reduced Motion steuern bzw. begrenzen die Schicht. Die Option ist im Rap-Modus automatisch aktiv, sofern synchronisierte Lyrics vorliegen.

## Prioritäten und Grenzen

1. Pause, nicht synchronisierte Lyrics, Instrumental-Hinweise und reduzierte Bewegung: **kein vokaler Akzent**.
2. Benutzerdefinierte Choreografien behalten Vorrang (deutlich abgeschwächte Zusatzbewegung).
3. Zeitgestempelte Wörter liefern kurze Akzente; zeilenbasierte Lyrics nur schwache Zeilenakzente. Lücken werden nicht mit erfundenen Silben gefüllt.
4. Benutzerdefinierte V385-/V416-Lead/Feature/Hook/Duett-Zuordnung bestimmt die Avatar-Rolle, sofern für denselben Track aktiv. Nicht zugewiesene Avatare bleiben im Hintergrund, ihre Tanzanimation läuft weiter.
5. Keine echte automatische Trennung einzelner Stimmen, Adlibs, Betonungen oder Sprecher. Dafür sind weitere, verlässliche Daten nötig.

## Prüfungen

```sh
npm run test:v472
npm run test:v472:types
npm run verify:v472
# mit lokal installierten Abhängigkeiten:
npm install
npm run typecheck
npm run build
```

Im bereitgestellten Offline-Arbeitsverzeichnis sind die Next.js-, React- und Three.js-Abhängigkeiten nicht installiert; daher wurde kein vollständiger Produktions-Build oder Raspberry-Pi-Gerätetest behauptet.
