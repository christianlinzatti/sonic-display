# V743 – Beat & Bass Motion

## Was ist implementiert?

- Echte Kick-, Beat-, Bass- und Attack-Pegel aus der bereits verwendeten `AudioAnalysisContext`-Pipeline modulieren die prozeduralen Hueftbewegungen.
- Kick-Akzente verstaerken das (nach unten gerichtete) `Hip_Bounce`, Bass unterstuetzt `Hip_Sway` und `Hip_Circle`.
- Das Profil unterscheidet Deutschrap, Hardtekk, Hardstyle, Rock und Pop und reduziert die Reaktion in ruhigen Songabschnitten.
- Die Huelle fuer Kick und Bass hat getrennte Anstiegs- und Abklingzeiten, um harte Spruenge zu vermeiden.
- Die V738-Bewegungsstaerke bleibt massgeblich. Bei 0 % gibt es auch bei starken Audiosignalen keine V743-Zusatzbewegung.
- Bei Pause, Seek, Trackwechsel, Reduced Motion oder manuellen GLB-/Timeline-Animationen werden Signale freigegeben.
- Die V737/V492-Fuss-Kontaktlogik bleibt verantwortlich. Ohne brauchbare IK ist keine zusaetzliche Beckenverschiebung erlaubt; fixierte Fussgelenke erhalten keinen Zusatzwinkel.
- `SettingsPanel` speichert `avatarBeatBassV743` (an/aus, Gesamtstaerke, Kick, Bass, Empfindlichkeit).
- `AvatarEditor` hat einen ausdruecklichen Schalter fuer simulierte Kick-/Bass-Signale nur in der Vorschau; die Livebuehne generiert **keine** Demo-Beats.

## Hinweise

- Fuer tatsaechliche Musikreaktion muessen von der bestehenden Audioanalyse Pegel geliefert werden (Audio-Berechtigungen, laufende Analyse und Quellenqualitaet beachten).
- Die Auslenkungen sind kleine additive Offsets; keine GLB-Aenderungen und keine neue unabhaengige Gesaessverformung.
- Die Signale dienen der reaktiven Verstaerkung, nicht einem nachgewiesenen samplegenauen Beat-Sync. Die Phase wird weiter vom Songclock/BPM bestimmt.
- Um die V743-Reaktion in der 3D-Vorschau beurteilen zu koennen: GLB mit Beckenknochen auswaehlen, unter Hip Motion Studio eine Bewegung anwaehlen, Demo einschalten und Play nutzen.

## Lokal pruefen

```bash
npm ci
npm run verify:v743
```

Die Checks fuer TypeScript und Produktionsbuild muessen vor einer Produktionsfreigabe wirklich erfolgreich sein. Details siehe `V743-VERIFICATION.md`.
