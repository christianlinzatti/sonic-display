# V772 – Adaptive Stage Lighting (auf V771)

## Umsetzung

- **Bis zu acht echte Zusatzlichter gleichzeitig** in der Rock-Arena, sonst bis zu sieben, zuzüglich unverändertem Ambient-Licht. Gemeint sind die drei/vier Hauptbühnenlichter, bis zu zwei Atmosphäre-Spots, ein Detail-Spot und ein Rock-Truss-Spot.
- Der bestehende V640-FPS/P95-Governor bestimmt die Druckstufe aus bereits gemessenen Renderfenstern. `full → trimmed → minimal` verringert den Lichtumfang nur nach anhaltender Belastung; lange gesunde Messungen erlauben die Rückkehr. Keine eigene Abtastschleife, Timer oder Renderer.
- Key und Fill bleiben in allen Qualitätsstufen aktiv. Unter Last werden zuerst Extras ausgeschaltet: Floorspot und Zusatzspots, danach der zentrale Effektspot. Lichtintensitäten und manuelle Blackouts/Timestamps der verbleibenden Lichter bleiben unverändert.
- `visible=false` entfernt Three.js-Lichter tatsächlich aus der Shader-Lichtliste. Nur `intensity=0` würde die Shader-Lichtanzahl nicht reduzieren.
- Rock Arena verwendet statt drei echten Truss-Spots nur einen, behält aber die drei sichtbaren Bühnenleuchten als emissive Meshes.
- Das Konzert-Canvas hatte bereits vor V772 `shadows={false}`. V772 setzt außerdem `castShadow={false}` an der verbliebenen Bühnenbeleuchtung; es kann hier nicht zu weiteren Schattenkarten-Einsparungen kommen.
- Die V772-Policy verwendet sechs gefrorene, wiederverwendbare Lichtpläne und erzeugt keine Objekte in `useFrame`.

## Grenzen und Verifikation

Bis zum Browser-Benchmark ist **kein realer FPS-Gewinn nachgewiesen**. Das reduzierte Lichtbudget verringert Shader-Lichtberechnungen, nicht automatisch die Render-Draw-Calls. V640 nutzt End-to-End-Framezeiten und keine GPU-Time-Queries. Eine Ursache allein in der GPU ist dadurch nicht belegbar. Lyrics, Lip-Sync, Motion und Kameratimings sind von der Lichtbudget-Policy unabhängig.

Tests: `npm run test:v772`, `npm run test:v772:types`, `npm run verify:v772:static`. Vollständigen TypeScript-Check und Next.js-Produktionsbuild nach `npm ci` testen. Für die reale Wirkung vor/nach V772 mit demselben GLB-Ensemble, Genre, Bühne und Display/DPR vergleichen.
