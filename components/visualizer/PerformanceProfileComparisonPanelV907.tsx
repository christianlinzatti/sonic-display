'use client';
/** V907: visualizes only completed and user-annotated V905 runs.
 * No timers, storage, additional subscriptions, camera mutation or WebGL.
 */
import {useMemo} from 'react';
import {activeProfileRunsV907,buildProfileComparisonV907,exportProfileComparisonV907,
 type ProfileRunV907,type ProfileSummaryV907} from './performanceProfileComparisonV907';
import type {BenchmarkRunV905} from './guidedConcertBenchmarkV905';
const effectNames={reduced:'FX reduziert',standard:'FX Standard',full:'FX stark'};
const fmt=(x:number)=>x.toFixed(1);
const statusNames={insufficient:'Weitere Läufe nötig',variable:'Messungen schwanken',similar:'Kein klarer Unterschied',
 'observed-higher':'Profil B höher', 'observed-lower':'Profil B niedriger'};
const profileName=(g:ProfileSummaryV907)=>`${g.tier} · ${g.avatars} GLB (Angabe) · ${effectNames[g.effects]}`;
export function PerformanceProfileComparisonPanelV907({history,tagged}:{history:readonly BenchmarkRunV905[];
 tagged:readonly ProfileRunV907[]}){
 const active=useMemo(()=>activeProfileRunsV907(tagged,history),[tagged,history]);
 const result=useMemo(()=>buildProfileComparisonV907(active),[active]);
 const download=()=>{
  const blob=new Blob([exportProfileComparisonV907(active)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  try{const a=document.createElement('a');a.href=url;a.download='sonic-profile-comparison-v907.json';a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <section aria-label="V907 Performance Profile Comparison Studio" style={{border:'1px solid #7778',borderRadius:10,padding:11,display:'grid',gap:10,margin:'10px 0'}}>
  <b>V907 · Performance Profile Comparison Studio</b>
  <small>Vergleiche echte V905-Messwerte verschiedener Leistungsprofile, GLB-Anzahlen und FX-Aufbauten. GLB-Anzahl und FX-Aufbau sind <strong>vor dem Start selbst angegebene Labels</strong>; Sonic Display kontrolliert diese Angaben nicht und verändert die Bühne nicht.</small>
  <div role="status" aria-live="polite"><strong>{active.length} zugeordnete Messläufe · {result.groups.length} Konfigurationen</strong></div>
  {!result.groups.length?<small>Wähle oben vor dem nächsten V905-Benchmark die tatsächlich eingestellte GLB-Anzahl und FX-Situation. Drei identische Durchläufe je Konfiguration bilden eine erste Vergleichsgrundlage.</small>:
   <div style={{display:'grid',gap:8}} aria-label="V907 Gemessene Konfigurationen">
    {result.groups.map((g,i)=><div key={g.id} style={{border:'1px solid #7776',borderRadius:8,padding:9}}>
     <b>Profil {i+1}: {profileName(g)}</b>
     <small style={{display:'block'}}>{g.count} echte Läufe · Szene #{g.sceneIndex+1} · {g.preset} · Ziel {g.targetFps} FPS · {g.evidence==='repeatable'?'Wiederholbar':g.evidence==='variable'?'Schwankend':'Noch zu wenige Läufe'}</small>
     <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:6}}>
      <span><strong>{fmt(g.fpsMedian)} FPS</strong> Median</span>
      <span>{fmt(g.frameMsMedian)} ms Framezeit</span>
      <span>{fmt(g.p95WindowMean)} ms Ø P95-Fenster</span>
      <span>{fmt(g.pressureMean*100)} % FX-Druck</span>
     </div>
     <div style={{marginTop:5,background:'#7773',height:9,borderRadius:5,overflow:'hidden'}} role="img" aria-label={`Profil ${i+1}, ${fmt(g.fpsMedian)} FPS Median`}>
      <div style={{height:'100%',width:`${Math.max(0,Math.min(100,g.fpsMedian/g.targetFps*100))}%`,background:g.fpsMedian>=g.targetFps*.8?'#83d8b2':'#e5be7b'}}/>
     </div>
    </div>)}
   </div>}
  <div style={{display:'grid',gap:7}} aria-label="V907 Profilvergleiche">
   <b>Direkte Konfigurationsvergleiche</b>
   {!result.pairs.length?<small>Für einen direkten Vergleich sind zwei unterschiedliche Konfigurationen desselben Songs, derselben Szene, Messdauer und FPS-Zielsetzung nötig.</small>:
    result.pairs.map((p,i)=><div key={`${p.left}-${p.right}-${i}`} style={{borderLeft:'3px solid #b4a17b',padding:'4px 9px',background:'#7772'}}>
     <b>Profil {result.groups.findIndex(g=>g.id===p.left)+1} vs. Profil {result.groups.findIndex(g=>g.id===p.right)+1} · {statusNames[p.status]}</b>
     <small style={{display:'block'}}>{p.deltaFps===null?'Noch keine Differenz aussagekräftig':`B − A: ${p.deltaFps>0?'+':''}${fmt(p.deltaFps)} FPS (${p.deltaPercent!>0?'+':''}${fmt(p.deltaPercent!)} %)`}</small>
     <small style={{display:'block'}}>{p.explanation}</small>
    </div>)}
  </div>
  <button type="button" className="concert-transition-export-v884" disabled={!result.groups.length} onClick={download}>V907 Profilvergleich als JSON exportieren</button>
  <small>Keine automatische Wahl eines „besten“ Profils: GLB- und FX-Angaben stammen vom Nutzer und sind nicht technisch verifiziert. Unterschiedliche Kamera-/Avatar-Ausschnitte, Szenen oder externe Prozesse können die Messungen beeinflussen. Kein Raspberry-Pi-Benchmark und keine Vorhersage künftiger Hardware.</small>
 </section>;
}
