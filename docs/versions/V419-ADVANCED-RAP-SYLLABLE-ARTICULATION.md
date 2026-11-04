# Sonic Display V419 – Advanced Rap Syllable Articulation

## Umfang

V419 ergänzt die bestehende V405/V415-Mundanimation um optionale, sanft überblendete **aus dem Text geschätzte Vokalkern- und Silbenbewegungen**. Wörter erhalten ihre tatsächlichen Anfangs- und Endzeitstempel aus den synchronisierten Lyrics; **innerhalb eines Wortes sind alle zeitlichen Mundphasen heuristisch verteilt**, nicht gemessen. Kein Audio-to-phoneme / forced alignment, kein Sprecher-Diarisieren.

### Funktionsumfang

- `components/visualizer/rapSyllableArticulationV419.ts`: reine deterministische, seek-sichere Schätzung aus Text-Vokalkernen mit DE-Umlauten, reduzierter Impulszahl für besonders schnelle Wörter, weichen Übergängen und begrenztem Einfluss auf die Mundformen.
- `vocalPerformanceQualityV374.ts`: V419 nach der bestehenden V415-Lippenpräzision, ohne Gesten, Timing, Rollen, Kamera oder Lip-Sync-Körper zu verschieben.
- `VisualizerStage.tsx`, `registry.tsx`, `ThreeAvatar.tsx`, `VocalRigV368.tsx`: Weitergabe in beide Avatar-Renderpfade.
- `SettingsPanel.tsx` und `VocalSyncInspectorV373.tsx`: Aktivierung, Intensität, Übergangsglättung, diagnostische Werte; ohne automatisches Aktivieren.
- `types/music.ts`, `context/UiPreferencesContext.tsx`: persistente Defaults. Bestehende Profile werden ohne Migration übernommen.

### Grenzen

Keine erfundenen Silben-Zeitstempel: Die Anzahl der geschätzten Vokalkerne wird zur visuellen Formung innerhalb der validierten Wortdauer genutzt, ist jedoch **nicht** die Anzahl nach linguistischer Silbentrennung und sagt nichts über tatsächliche Rap-Phoneme aus. Pausen, fehlende Wortmarken, `reducedMotion`, deaktivierter Modus und fehlende Rap-Rolle führen zu neutralem V419-Pass. B/P/M-Lippenschluss der älteren Engine wird nicht verändert; manuelle Begleitrollen bleiben stumm.

### Benutzung

Einstellungen → Anzeige → `V419 · Rap-Silbenartikulation (Textschätzung)` einschalten. Empfohlene Startwerte: Stärke 65 %, Übergangsglättung 70 %. Im Vocal Sync Inspector werden nur textbasierte Schätzungen gezeigt. Für die GLEICHE Mundzeit empfiehlt sich V415, sofern ein Zeitversatz notwendig ist. V418 Quality Inspector bleibt für Lyrics/Mund/Gesten/Rollen separat verfügbar.

### Lokal verifizieren

```powershell
npm install
npm run test:v419
npx tsc --noEmit
npm run build
```

Der vollständige Next.js-Build ist erst nach diesen Schritten auf einem Rechner mit den installierten Abhängigkeiten bestätigt. Das Release-ZIP enthält kein `node_modules`.
