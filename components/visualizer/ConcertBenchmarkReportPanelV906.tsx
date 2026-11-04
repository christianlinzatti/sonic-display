'use client';
/** V906 – detailed in-memory report of V905-completed runs, no telemetry subscription,
 * polling, timers, WebGL canvas, changes to settings or hardware assumptions. */
import {useMemo,useState} from 'react';
import type {BenchmarkRunV905} from './guidedConcertBenchmarkV905';
import {createConcertBenchmarkReportsV906,exportConcertBenchmarkReportV906,exportConcertBenchmarkMarkdownV906,
 type BenchmarkReportV906,type ReportSeverityV906} from './concertBenchmarkReportV906';
interface Props {history:readonly BenchmarkRunV905[]}
const fmt=(v:number)=>v.toFixed(1);
const severityColor:Record<ReportSeverityV906,string>={note:'#9cadc7',attention:'#e7bd79',risk:'#e99797'};
const evidenceLabel:Record<BenchmarkReportV906['evidence'],string>={insufficient:'Noch zu wenige Läufe',variable:'Schwankende Messungen',repeatable:'Wiederholte Messung'};
export function ConcertBenchmarkReportPanelV906({history}:Props){
 const reports=useMemo(()=>createConcertBenchmarkReportsV906(history),[history]);
 const [selectedId,setSelectedId]=useState<number|null>(null);
 const selected=reports.find(r=>r.groupId===selectedId)??reports[0];
 const download=(format:'json'|'md')=>{
  const contents=format==='json'?exportConcertBenchmarkReportV906(history):exportConcertBenchmarkMarkdownV906(history);
  const url=URL.createObjectURL(new Blob([contents],{type:format==='json'?'application/json;charset=utf-8':'text/markdown;charset=utf-8'}));
  try{const a=document.createElement('a');a.href=url;a.download=`sonic-concert-benchmark-report-v906.${format}`;a.click();}
  finally{URL.revokeObjectURL(url);}
 };
 return <section aria-label="V906 Concert Benchmark Report Studio" className="concert-benchmark-report-v906"
  style={{border:'1px solid #7778',borderRadius:10,padding:12,margin:'10px 0',display:'grid',gap:9}}>
  <strong>V906 · Concert Benchmark Report Studio</strong>
  <small>Berichte aus abgeschlossenen V905-Durchläufen. Kein automatischer Benchmark, keine zusätzlichen Mess- oder Renderprozesse.</small>
  {!reports.length?<small>Noch keine abgeschlossenen V905-Läufe für einen Bericht. Starte oben einen Benchmark.</small>:<>
   <label style={{display:'grid',gap:3}}>
    <span>Bericht auswählen · {reports.length} getrennte Messgruppen</span>
    <select aria-label="V906 Benchmark-Bericht auswählen" value={selected?.groupId??''}
     onChange={(e:{target:{value:string}})=>setSelectedId(Number(e.target.value))}>
     {reports.map((r,i)=><option key={r.groupId} value={r.groupId}>
      Bericht {i+1}: Szene {r.sceneIndex+1} · {r.tier} · {r.preset} · {r.targetFps} FPS ({r.count} Läufe)
     </option>)}
    </select>
   </label>
   {selected&&<div aria-label="V906 ausgewählter Benchmark-Bericht" style={{display:'grid',gap:9}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
     <b>{evidenceLabel[selected.evidence]}</b>
     <small>Profil {selected.tier} · Ziel {selected.targetFps} FPS · {selected.count} Läufe</small>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(125px,1fr))',gap:7}}>
     {[
      {title:'Median-FPS',value:fmt(selected.fpsMedian)},
      {title:'FPS-Spannweite',value:`${fmt(selected.fpsMin)}–${fmt(selected.fpsMax)}`},
      {title:'FPS-IQR',value:fmt(selected.fpsIqr)},
      {title:'Framezeit-Median',value:`${fmt(selected.frameMsMedian)} ms`},
      {title:'Ø P95-Fenster',value:`${fmt(selected.p95WindowMean)} ms`},
      {title:'Ø FX-Druck',value:`${fmt(selected.pressureMean*100)} %`}
     ].map(item=><div key={item.title} style={{background:'#7772',borderRadius:7,padding:8}}>
      <small style={{display:'block'}}>{item.title}</small><b>{item.value}</b>
     </div>)}
    </div>
    <div style={{display:'grid',gap:5}}>
     <b>Messläufe – FPS-Median pro Durchlauf</b>
     {selected.runs.map(r=><div key={r.index} style={{display:'grid',gridTemplateColumns:'55px 1fr 72px',gap:7,alignItems:'center'}}>
      <small>Lauf {r.index}</small>
      <div style={{background:'#7773',height:9,borderRadius:5,overflow:'hidden'}} role="img"
       aria-label={`Lauf ${r.index}: ${fmt(r.fpsMedian)} FPS` }>
       <div style={{height:'100%',width:`${Math.min(100,Math.max(0,r.fpsMedian/selected.targetFps*100))}%`,
        background:r.fpsMedian>=selected.targetFps*.8?'#83d8b2':'#e7bd79'}}/>
      </div>
      <small style={{textAlign:'right'}}>{fmt(r.fpsMedian)} FPS</small>
     </div>)}
     <small>Rahmenmaß: FPS-Ziel. Die Balken sind auf 100 % begrenzt; die Zahl zeigt den Original-Median. Kein visueller Qualitäts-Score.</small>
    </div>
    <div style={{display:'grid',gap:6}} aria-label="V906 Hardware- und Performance-Hinweise">
     <b>Einordnung und nächste Schritte</b>
     {selected.findings.map(f=><div key={f.code} style={{borderLeft:`3px solid ${severityColor[f.severity]}`,padding:'4px 9px',background:'#7772'}}>
      <strong style={{display:'block'}}>{f.title}</strong>
      <small style={{display:'block'}}>{f.detail}</small>
      <small style={{display:'block'}}>Empfehlung: {f.nextStep}</small>
     </div>)}
    </div>
   </div>}
  </>}
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type="button" className="concert-transition-export-v884" disabled={!reports.length}
    onClick={()=>download('json')}>V906-Bericht als JSON exportieren</button>
   <button type="button" className="concert-transition-export-v884" disabled={!reports.length}
    onClick={()=>download('md')}>V906-Bericht als Markdown exportieren</button>
  </div>
  <small>Datensparsam: Nur Sitzungsdaten aus V905, keine Spotify-Kennung im Bericht, keine Speicherung. Keine Aussage über Raspberry-Pi- oder Mini-PC-Leistung ohne echten Test am Zielgerät. P95-Fenstermittelwerte sind kein globales Frame-P95.</small>
 </section>;
}
