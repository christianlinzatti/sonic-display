# Sonic Display V475 – Intelligent Multi-Avatar Interaction

## Umsetzung

Für automatische 3-/4-Artist-Bühnen ergänzt `components/visualizer/intelligentMultiAvatarInteractionV475.ts` die vorhandenen V444/V460-Regie-Cues. Die Pure Function `refineMultiAvatarInteractionV475` ist direkt nach `featureInteractionV460` im `ThreeAvatar.tsx`-Renderer verdrahtet; ihre Ausgaben laufen weiterhin durch die etablierten V452-Mixer und V144/V145-Partner-Look-/Gesture-Contexts.

- **Verse:** Fokus auf den sichtbaren Bühnen-Lead, kurze zeitlich versetzte Zuhörerreaktionen und dezente links/rechts variierte Arm- und Schulterakzente.
- **Visuelle Reply-Szenen:** Der V460-Partner und der Stage-Lead beachten einander kurzfristig. Die Reply-Zuordnung ist **Show-Regie**, keine verifizierte Erkennung der Stimme im Audiomix.
- **Hooks:** Dieselbe rhythmische Kopf-Nickphase für alle sichtbaren Akteure, Blick weiter zum Publikum, gleichmäßige Energie ohne identische große Armgesten.
- **Saubere Übergänge:** Fade-in nach Bühnen-Cue-Wechsel, reine Berechnung aus Playback-Zeit ohne Timer und ohne zusätzlichen React-State. Seeks erzeugen dasselbe Ergebnis.
- **Schutzregeln:** Manuell authorierte Vocal-/Duett-Zuordnungen, gespeicherte Bühnenregie, andere aktive Performance-Direktoren, Pause, Reduced Motion, fehlende Song-ID sowie ungültige Stage-Positionen bleiben unverändert. Es entstehen **keine** neuen Sängerrollen.
- **Performance:** Bei niedrigem Quality-Tier werden Zusatzgesten stark reduziert. Keine neuen Meshes, Beleuchtungen, Netzwerkzugriffe oder GLB-/Root-Transforms.

Die automatische 3-/4-Artist-Bühne wird weiterhin durch V442 aktiviert. Bei zwei Artists läuft die bisherige Duo-Pipeline weiter; V475 verändert sie nicht. Stärke und Aktivierung nutzen vorhandene V444-Einstellungen, ohne Migration.

## Grenzen

Die Engine greift nur auf bereits vorhandene visuelle Bühnen- und Playback-Cues zu, keine zusätzliche Beat- oder Singer-Analyse. V460-„reply“ bezeichnet eine visuelle Reaktion, nicht ein nachgewiesenes Wechseln des Rappers. Imported GLB-Clips, authored Sänger-Timestamps und die reguläre Lippensynchronisation bleiben unverändert. Es gibt keine Aussage zu realen FPS auf dem Raspberry Pi.

## Prüfung

```powershell
npm run test:v475
npm run test:v475:types
npm run check:architecture
npm run build
```

Der V475-Test prüft Determinismus, originale Inputs, manuelle Vorrangregeln, 4er-Hooks und Reply-Szenen, Signalgrenzen, reduzierte Performance-Tiers und die Integration der Live-Contexts. Ein vollständiger `next build` ist ohne installierte Projektdependencies hier nicht möglich; der letzte vom Benutzer bestätigte vollständige Build stammt aus V473.7.
