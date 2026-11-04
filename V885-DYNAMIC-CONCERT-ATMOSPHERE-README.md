# Sonic Display V885 – Dynamic Concert Atmosphere

Vollständiger Projektstand aus **V884**, inklusive der früheren V880–V884-Funktionen.

## Neue Funktion

- V885 erstellt pro **verifiziertem V604/V763-Songabschnitt** eine atmosphärische
  Licht- und Bühnenpalette. Genre-/Look-Voreinstellungen: **Noir (Deutschrap)**,
  **Electric (Hardtekk)**, **Arena (Deutschrock)**, **Dream (Pop)**.
- Verse, Build-ups, Hooks, Drops und ruhige Passagen erhalten unterschiedliche
  Farbgewichte. **Intimate**-Abschnitte bleiben zurückhaltend. An exakt benachbarten
  Szenen erfolgt eine deterministische, sanfte Farbinterpolation (1,6 bis 4,8 s).
- Integration in die **vorhandene** R3F-Bühne: nur kleine Farb-Tints der bereits
  vorhandenen Key-/Fill-Lichter und des existierenden Boden-/Hintergrundmaterials.
  Keine zusätzlichen Scheinwerfer, Geometry-, Texture- oder Audio-Allokationen.
- Optionaler, sehr transparenter CSS-Glow und ein kleiner Dunst-Look: rein visuelle
  Farbflächen, **kein 3D-Volumenebel** (V887 vorgesehen).
- Neues Regiepult unter **✦ LIVE FX → V885 · Dynamic Concert Atmosphere**:
  Palette, Intensität, Fade-Stil, getrennte Schalter für Lichter, 3D-Umgebung,
  Dunst und Overlay; drei Farbfelder als aktive Vorschau, Abschnittsliste,
  JSON-Export. Einstellungen in `sonic-dynamic-concert-atmosphere-v885`.
- Die Licht-/Umgebungsfarben ändern sich nur bei aktivem, laufendem Track mit
  bestätigtem Songplan. **Pausieren, Seek-Guard, Songwechsel, Blackout,
  reduzierte Bewegung, Low-GPU, Lyrics-Schutz und gespeicherte Licht-Timelines**
  haben Vorrang. In den 3D-Kanälen werden keine manuellen Lichter überschrieben.

Die Farben sind ästhetische Vorschläge aus dem vorhandenen Abschnittsplan und
**keine** nachträgliche Audio-, Stimm- oder Beat-Erkennung. Fehlt ein verifizierter
Plan, bleibt die neue Automatik aus; das manuelle V881-Deck bleibt bedienbar.

## Installation und Überprüfung auf Windows

```powershell
npm ci
npm run verify:v885:focused
npm run check:architecture
npm run typecheck
npm run build
npm run dev
```

Oder: `powershell -ExecutionPolicy Bypass -File scripts/verify-v885-windows.ps1`

Für die echte visuelle Abnahme: Song mit verifizierter Timeline, unterschiedliche
Verse/Hook/Drop/Break-Abschnitte, manuelle Light-Timeline, Blackout,
`prefers-reduced-motion`, Pause, Seek und Trackwechsel ausprobieren.

Der isolierte TypeScript-Check verwendet test-spezifische Stubs nur unter
`tests/stubs/`; **nicht** als Ersatz für produktive React-/Three-Typen. Status und
Prüfgrenzen siehe `V885-VERIFICATION.md`.
