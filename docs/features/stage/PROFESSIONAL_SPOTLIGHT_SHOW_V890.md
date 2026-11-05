# Sonic Display V890 – Professional Spotlight Show

## Was neu ist

V890 choreografiert **die bereits vorhandenen** beiden V308-Spotlights und ihre 3D-Lichtkegel: Künstler-Portrait, Follow-Spot, breite Lichtfächer und sanfte Kreuzbewegungen. Die Beleuchtung folgt ausschließlich verifizierten V604-Songabschnitten, ohne eine zusätzliche 3D-Beleuchtung, einen neuen Renderpass oder unabhängig abgeleitete Vocal-Informationen zu erzeugen.

Im **Live FX Deck → V890 Professional Spotlight Show** sind Automatik/Manuell, Genre-Look, Intensität, Künstler-Fokus, Lyrics-Schutz und weiche Übergänge einstellbar. Die Konfiguration bleibt lokal gespeichert; bestätigte Szenen lassen sich als JSON exportieren. Ein manuell eingestellter Look wird ebenfalls nur bei gültigem Songabschnitt und aktivierter automatischer Bühne angewandt; er ist kein unabhängig ausgelöster Licht-Override.

## Sicherheit / Priorität

Die Intensitätsmultiplikatoren sind immer **≤ 1** und werden erst nach den bisherigen Lichtbudgets angewandt. Die Anzahl realer Spotlights, deren Schattenkonfiguration, die Licht-/Overdraw-Budgets und bestehende Timelines bleiben unverändert. Ohne passende, verifizierte Timeline, bei anderem Track, nach Seek, Pause, Blackout, manueller Licht-/Show-FX-Steuerung, Lyrics-Schutz oder reduzierter Bewegung sind V890-Cues deaktiviert. Bestehende Scheinwerfer wechseln dann sanft zur vorherigen Ausrichtung/Breite zurück. Keine Hardware-Scheinwerfer oder Strobe-/Flash-Auslösung.

Follow-Spots verwenden **nur** bereits vom bestehenden V551-Lichtsystem ausgewählte und räumlich vorhandene GLB-Slots. Fehlende Performer erhalten keinen erfundenen Vocal-Fokus. Die Bühnenoptimierungen werden in der vorhandenen `useFrame`-Schleife berechnet; es gibt keine zusätzlichen Timer, React-Updates pro Frame oder neuen GLB-Inhalte.

## Prüfungen

```powershell
npm ci
npm run verify:v890:focused
npm run test:module-case
npm run check:syntax
npm run typecheck
npm run build
```

Windows: `powershell -ExecutionPolicy Bypass -File scripts/verify-v890-windows.ps1`.

Die fokussierten TypeScript-Prüfungen mit lokalen Test-Stubs ersetzen **nicht** die vollständigen echten React-/Three-/Next.js-Typen. Vollständiger `typecheck`, `next build` und ein beobachteter WebGL-Konzertdurchlauf bleiben eigenständige Release-Kriterien. Fehlende Abhängigkeiten verhindern eine verlässliche Produktionsfreigabe.
