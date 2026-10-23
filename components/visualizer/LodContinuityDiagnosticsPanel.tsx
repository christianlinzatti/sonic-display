"use client";
import {useLodContinuityDiagnostics} from "./lodContinuityDiagnostics";
const fmt=(n:number|null,digits=1)=>n===null?"–":n.toFixed(digits);
export function LodContinuityDiagnosticsPanel(){
  const d=useLodContinuityDiagnostics();
  return <section className="render-diagnostics" aria-label="LOD Animationssynchronität">
    <h3>LOD Motion Continuity</h3>
    <p className="settings-note">Live-Vergleich zweier LOD-Modelle während des Crossfades; nur Diagnose, keine Animationskorrektur.</p>
    <div className="render-diagnostics-grid">
      <div><strong>Status</strong><div>{d.active?"Crossfade aktiv":"Warte auf LOD-Wechsel"}</div></div>
      <div><strong>Sync Score</strong><div>{d.score===null?"–":`${d.score}/100`}</div></div>
      <div><strong>Clip-Offset</strong><div>{fmt(d.maxClipDeltaMs)} ms ({d.clipsCompared} Clips)</div></div>
      <div><strong>Pose-Abweichung Ø</strong><div>{fmt(d.averageAngularErrorDeg)}° ({d.bonesCompared} Bones)</div></div>
      <div><strong>Max. Bone-Abweichung</strong><div>{fmt(d.maxAngularErrorDeg)}°</div></div>
    </div>
    {d.active && <p className="settings-note">{d.variants.map(s=>s.split('/').pop()).join(' ↔ ')}</p>}
    {d.warning && <p className="settings-note">{d.warning}</p>}
    <p className="settings-note">Heuristische Kennzahl, keine Garantie für optisch nahtlose Übergänge. Unterschiedliche Rig-Strukturen sind nur begrenzt vergleichbar.</p>
  </section>;
}
