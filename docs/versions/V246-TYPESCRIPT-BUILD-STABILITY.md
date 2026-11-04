# Sonic Display V246 – TypeScript Build Stability

Basiert vollständig auf V245 Phrase Variation Hotfix. Korrigiert in `components/visualizer/ThreeAvatar.tsx`:

- `useRef<MotionPlanSnapshot | undefined>(undefined)` für die React-Typen.
- `audio.bpm ?? undefined` an `advanceBeatTransport` und `updateBeatFootwork`.
- Null-Guard `const avatarRoot = root.current; if (!avatarRoot) return;` und Weitergabe an FootIK und FootContact.
- `window.performance.now()` statt der durch den lokalen PerformanceDirector verdeckten globalen API.

Weitere V245-Hotfixes für Genres, Benchmark-Namenskonflikte, Lighting Analyzer, Motion Matching und Phrase Variations sind enthalten.

## Testen

```sh
npm install
npm run typecheck
npm run build
```

Ein vollständiger Next.js Build ist erst möglich, wenn die npm-Abhängigkeiten installiert sind.
