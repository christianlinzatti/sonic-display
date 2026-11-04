# Sonic Display V884 – Cinematic Concert Transitions

Vollständiges Quellcodeprojekt auf Basis von V883; V880–V883 bleiben erhalten.

## Was ist neu?

- **Szene an Szene**: V884 verwendet ausschließlich angrenzende, verifizierte
  Songabschnitte des bestehenden V763/V604-Plans. Es werden keine echten Beats,
  Drops, Sänger oder Kamerashots erkannt oder erfunden. Ohne entsprechende
  Timeline bleibt die neue Automatik aus; das manuelle V881-FX-Deck funktioniert.
- **Sanfter optischer Übergang**: kurzer und sehr transparenter Farb-/Glow-
  Schleier an Szenengrenzen (maximal 17% Deckkraft). Bei ruhigen Abschnitten
  zusätzlich gedämpft; bei `prefers-reduced-motion` abgeschaltet.
- **3D-Licht-Überblendung**: ein leichter, max. +8%/-6% Akzent und ein kleiner
  Positionsversatz auf dem **bereits vorhandenen** Spotlight. Kein neuer
  Lichtkörper, keine Strobe-/Full-Stage-Flash-Injektion.
- **Kamerabewegung**: Sanftes Verlangsamen **nur** der bereits bestehenden,
  automatischen R3F-Kamerainterpolation. Keine harte Kamerapositionierung oder
  Umschreibung gespeicherter Shots. Manuelle Keyframes, Edits, Cuts, Lyrics-
  Schutz und die bestehenden Kamera-Prioritätsregeln bleiben erhalten.
- **Regiepult**: Öffne `✦ LIVE FX` und finde **V884 – Cinematic Transitions**.
  Es gibt Ein/Aus, 3 Stile (Sanft/Cinematic/Arena), getrennte Schalter für
  Kamera, Licht und 2D-Visuals, sowie eine Liste und einen JSON-Export der
  bestätigten Übergänge. Browser-Storage: `sonic-cinematic-transitions-v884`.
- **Safety / Performance**: Keine dauerhaften FX nach Pause, Seek oder
  Trackwechsel; keine neuen WebGL-Meshes/Materialien, keine Audio-Verarbeitung
  oder neuen Server-APIs. Der optische Übergang läuft über eine einzelne
  transparente CSS-Ebene und die bestehenden Bühnenkanäle.

## Testen unter Windows

```powershell
npm ci
npm run verify:v884:focused
npm run check:architecture
npm run typecheck
npm run build
npm run dev
```

Alternativ:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-v884-windows.ps1
```

Zum Browser-Gegencheck einen Spotify-Track mit gültiger V604/V763-Timeline
abspielen; zwischen Verse, Build, Hook und Drop wechseln lassen. Einmal
manuelle Kamera, Kamera-Keyframes, Light-Timeline, Blackout, Reduced Motion,
Pause, Seek und Songwechsel testen. V884 greift nicht ein, wenn die Quelle
keine verifizierten Songabschnitte liefert.

## Nachweis / Grenzen

Siehe `V884-VERIFICATION.md`. Isolierte TypeScript-Tests nutzen ausschließlich
lokale Test-Deklarationen; der **vollständige Next.js-Produktionsbuild** und
Browser-/WebGL-Durchlauf sind gesondert zu prüfen.
