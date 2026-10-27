# Sonic Display V527 – Cinematic Multi-Avatar Performance 2.0

## Realisiert

- `cinematicMultiAvatarV527.ts`: eigener deterministischer, stateless *Ausdrucksplan* über dem bereits sicheren V517-Gruppenplan; spezifischer Stil `anchor`, `responder`, `groover`, `hype` pro Track+Slot, ohne Zufall oder Sprünge pro Frame.
- Lead/Feature-Szenen: langsame musikalische Phrasenbögen für blickgesteuerte Call-and-Response-Momente. Bei einer expliziten Sängerübergabe kann nur der vorherige Sänger bis zu 900 ms reagieren. Hooks richten Blickakzente zum Publikum; kein künstliches Rückgratwackeln pro Wort.
- Authentifizierte manuelle Casts gelten nur für denselben Track und ein gültiges Zeitfenster. Für automatisch erkannte Gruppen bleibt der Lead **visuell**, niemals eine Behauptung über den echten Sänger.
- Direkt eingebunden in `GroupDancersV326SceneV492.tsx` (3–4) und `DanceFormationActorsV492.tsx` (2). Die Ausgaben laufen weiter über V452-Akkumulation und vorhandene V506/V508-Kollisionsrisiken. Kein zusätzlicher useFrame-Callback, keine weiteren Abhängigkeiten.
- V527 liefert ein `focus`-Signal als **informative Kameraabsicht** (`lead`, `handoff`, `ensemble`, `drop`), steuert die Kamera und Lyrics selbst **noch nicht**. Keine Änderung an GLB-Clips, Skelett, Fußkontakten, manueller Choreografie oder Lip-Sync.

## Manuelle Abnahme

1. Deutschrap-Feature mit zwei verifizierten Sängerrollen und drei/vier Begleit-Avataren: Hand-off, Hook und Verse bei gleichen Timestamps visuell vergleichen.
2. In automatischen Gruppen auf verschiedene, aber über mehrere Sekunden ruhige Reaktionen achten; nicht als singende Künstler interpretieren.
3. Bei stehenden Beinen und eng stehenden Avataren auf ungewollte Hand- und Körperkollisionen prüfen.
4. Mit V522 einen echten 10-Zoll-Raspberry-Pi-Test durchführen; FPS/P99 und GLB-Aktionen beobachten.

## Nicht versprochen

Weder akustische Singer-Diarization noch automatische Kamera- oder Lyrics-Schnittfolgen, vollständige IK-Korrektur oder visuell bewiesene Bühnenqualität. Der isolierte TypeScript-Test prüft nicht den Produktionsbuild.
