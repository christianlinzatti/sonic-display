'use client';
import {useMemo,useState} from 'react';
import {RealConcertQualityStudioV513} from './RealConcertQualityStudioV513';
import {useVisualFramesV512} from './visualConcertQualityRuntimeV512';
import {demoStageV512,qualityComparisonV512,schematicPointsV512,
 type DemoScenarioV512} from './visualConcertQualityV512';
import {usePiConcertBudgetV479} from './piConcertRuntimeV479';
import {useAdaptivePerformance} from './adaptivePerformance';
const colors=['#67e8f9','#c4b5fd','#86efac','#fcd34d'];
const tiers={high:'High',balanced:'Balanced',low:'Low'} as const;
/** Read-only 2D storyboard of actual STAGE positions. It is not a 3D
 * skinned-mesh collision renderer. Demo mode is intentionally separate.
 */
export function VisualConcertQualityStudioV512(){
 const history=useVisualFramesV512(),adaptive=useAdaptivePerformance(),piBudget=usePiConcertBudgetV479();
 const [mode,setMode]=useState<'demo'|'live'>('demo');
 const [count,setCount]=useState(4);
 const [scenario,setScenario]=useState<DemoScenarioV512>('crossing');
 const [phase,setPhase]=useState(50);
 const [selected,setSelected]=useState(-1);
 const [pi,setPi]=useState<'off'|'balanced'|'eco'>('off');
 const usable=mode==='demo'||history.length>0;
 const frame=mode==='demo'?demoStageV512(count,phase/100,scenario):history[selected<0?history.length-1:Math.min(selected,history.length-1)];
 const points=useMemo(()=>frame?schematicPointsV512(frame):[],[frame]);
 const comparison=qualityComparisonV512(frame?.positions.length??count,pi);
 const full=frame&&frame.checkedPairs===frame.possiblePairs;
 return <section className="v512-quality-studio" aria-label="V512 Visual Concert Quality Studio">
  <h4>V512 – Visual Concert Quality Studio</h4>
  <p className="settings-note">Interaktive Bühnen-Draufsicht zur Fehlersuche. Die Live-Ansicht verwendet die wirklichen Bühnenpositionen und bereits vorhandene V508/V511-Kollisionsmessungen. Markierungen zeigen <em>Risiko pro Tänzer</em>, nicht einzelne kollidierende Knochen oder Meshes.</p>
  <div className="v512-controls">
   <label>Ansicht <select value={mode} onChange={e=>{setMode(e.target.value as 'demo'|'live');setSelected(-1);}}><option value="demo">Demo / Simulation</option><option value="live">Erfasste Live-Messungen</option></select></label>
   {mode==='demo'&&<><label>Tänzer <select value={count} onChange={e=>setCount(Number(e.target.value))}><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
    <label>Ablauf <select value={scenario} onChange={e=>setScenario(e.target.value as DemoScenarioV512)}><option value="crossing">Kreuzende Wege</option><option value="duet">Duett</option><option value="formation">Formationswechsel</option></select></label></>}
  </div>
  {mode==='demo'&&<label className="v512-scrubber">Simulierter Bewegungsverlauf <input type="range" min="0" max="100" value={phase} onChange={e=>setPhase(Number(e.target.value))}/><strong>{phase}%</strong></label>}
  {mode==='live'&&history.length>0&&<label className="v512-scrubber">Aufzeichnung (Sitzung, höchstens 45 Messpunkte) <input type="range" min="0" max={history.length-1} value={selected<0?history.length-1:Math.min(selected,history.length-1)} onChange={e=>setSelected(Number(e.target.value))}/><button type="button" onClick={()=>setSelected(-1)}>Neueste</button></label>}
  {usable&&frame?<>
   <svg className="v512-stage-diagram" viewBox="0 0 460 275" role="img" aria-label={`${frame.positions.length} Avatare in Bühnen-Draufsicht, ${frame.checkedPairs} von ${frame.possiblePairs} Paaren untersucht` }>
    <rect x="8" y="8" width="444" height="258" rx="14" fill="#111d31" stroke="#53647f"/>
    {[76,145,214,283,352,421].map(x=><line key={x} x1={x} y1="14" x2={x} y2="262" stroke="#2e405a" strokeDasharray="4 7"/>)}
    {[63,126,189].map(y=><line key={y} x1="14" y1={y} x2="446" y2={y} stroke="#2e405a" strokeDasharray="4 7"/>)}
    <text x="230" y="24" fill="#b9cadb" fontSize="11" textAnchor="middle">BÜHNENHINTERGRUND</text>
    <text x="230" y="260" fill="#b9cadb" fontSize="11" textAnchor="middle">PUBLIKUM ↓</text>
    {points.map((p,i)=><g key={i}>
     {p.risk!==null&&p.risk>=.35&&<circle cx={p.x} cy={p.y} r={26+20*p.risk} fill={p.risk>=.7?'#ef4444':'#f59e0b'} fillOpacity=".17" stroke={p.risk>=.7?'#ef4444':'#f59e0b'} strokeWidth="1.5" strokeDasharray="6 4"/>}
     <circle cx={p.x} cy={p.y} r="17" fill={colors[i]} stroke="#ffffff" strokeWidth="2"/>
     <circle cx={p.x} cy={p.y+7} r="2.5" fill="#122035"/>
     <text x={p.x} y={p.y-2} textAnchor="middle" fill="#13203a" fontWeight="bold" fontSize="13">{i+1}</text>
     <title>{`Avatar ${i+1}: ${p.risk===null?'keine individuelle Risikomessung':`Kapsel-Risiko ${(p.risk*100).toFixed(0)} %`}`}</title>
    </g>)}
   </svg>
   <div className="v512-legend">{frame.positions.map((_,i)=><span key={i}><i style={{background:colors[i]}}/> Tänzer {i+1} · {frame.risks[i]===null?'nicht einzeln geprüft':`${Math.round((frame.risks[i]??0)*100)} % Kapselrisiko`}</span>)}</div>
   <p role="status" aria-live="polite" className="settings-note">{mode==='demo'?<strong>SIMULATION – keine echten GLB- oder Kollisionsmesswerte.</strong>:<strong>LIVE-SITZUNG – {new Date(frame.at).toLocaleTimeString('de-AT')}, {frame.source==='duo'?'Duett':'Gruppe'}.</strong>} {' '}
     {mode==='live'?`Geprüfte Paare: ${frame.checkedPairs}/${frame.possiblePairs} · nahe Kapselpaare: ${frame.nearPairs} · Risikomaximum: ${Math.round(frame.maxRisk*100)} %. `:`Simulierter Bühnenabstand: nur schematisch, keine echte Kapselgeometrie. `}
     {mode==='live'&&!full?'Unvollständig untersuchte Paare dürfen nicht als sicher gelten.':''}</p>
  </>:<p role="status" className="settings-note">Noch keine echten Bühnenpositionen erfasst. Starte eine GLB-Mehr-Avatar-Show und aktiviere die Messung, oder verwende den Demo-Modus.</p>}
  <RealConcertQualityStudioV513 frame={frame} mode={mode}/>
  <h4>Qualitätsstufen vergleichen</h4>
  <p className="settings-note">Unverbindliche, berechnete Obergrenzen für die <strong>optionale Knochen-Kollisionsanalyse</strong> bei {frame?.positions.length??count} Tänzern. Keine FPS-Schätzung, keine gemessenen Renderzeiten und keine Änderung der tatsächlichen Einstellungen.</p>
  <label>Vergleichsprofil <select value={pi} onChange={e=>setPi(e.target.value as 'off'|'balanced'|'eco')}><option value="off">Ohne Pi-Sparprofil</option><option value="balanced">Pi Balanced</option><option value="eco">Pi Eco</option></select></label>
  <div className="v512-tier-cards">{comparison.map(v=><div key={v.tier} className={adaptive.tier===v.tier?'v512-active-tier':''}>
   <strong>{tiers[v.tier]}</strong><span>{v.hz?`${v.hz} Hz`:'Aus'}</span><small>{v.detail}</small>{adaptive.tier===v.tier&&<small>Aktuelle Grafikstufe</small>}
  </div>)}</div>
  <p className="settings-note">Aktuelles Pi-Profil: {piBudget.enabled?piBudget.level:'aus'}. Der Vergleich arbeitet unabhängig davon. Kritische Animation, GLB-Clip-Timing, Foot-IK und Lip-Sync werden nicht gedrosselt. Eine Live-Messung kann mehrere nicht prüfbare Paare enthalten.</p>
 </section>;
}
