'use client';
/** Local-only, on-demand V777 report inspection; does not create a canvas or upload data. */
import {useMemo,useState} from 'react';
import {assessConcertQualityV778,summarizeConcertQualityComparisonV778,type TargetFpsV778} from '@/services/monitoring/concertQualityAdvisorV778';
import {compareConcertReportsV777,type ConcertReportV777} from '@/services/monitoring/concertBenchmarkV777';

function unpack(value:unknown):ConcertReportV777|null{
 if(!value||typeof value!=='object')return null;
 const obj=value as {status?:unknown;report?:unknown;format?:unknown};
 if(obj.status!==undefined&&obj.status!=='ok')return null;
 const report=obj.report??obj;
 return report&&typeof report==='object'&&(report as {format?:unknown}).format==='sonic-concert-benchmark-v777'
  ?report as ConcertReportV777:null;
}
const format=(n:number,digits=1)=>n.toFixed(digits);
export function ConcertQualityAdvisorV778(){
 const [current,setCurrent]=useState<unknown>(null),[baseline,setBaseline]=useState<unknown>(null);
 const [target,setTarget]=useState<TargetFpsV778>(60),[message,setMessage]=useState('');
 const advice=useMemo(()=>current===null?null:assessConcertQualityV778(current,target),[current,target]);
 const comparison=useMemo(()=>{
  const b=unpack(baseline),c=unpack(current);
  if(!b||!c||advice?.status!=='ready'||assessConcertQualityV778(b,target).status!=='ready')return null;
  try{return summarizeConcertQualityComparisonV778(compareConcertReportsV777(b,c))}
  catch{return null}
 },[baseline,current,advice?.status,target]);
 async function load(file:File|undefined,kind:'current'|'baseline'){
  if(!file)return;
  if(file.size>5*1024*1024){setMessage('Datei zu groß (maximal 5 MB).');return}
  try{const parsed:unknown=JSON.parse(await file.text());
   if(kind==='current')setCurrent(parsed);else setBaseline(parsed);
   setMessage(`${file.name}: lokal eingelesen, nichts hochgeladen.`);
  }catch{setMessage('Datei ist kein gültiges JSON.');}
 }
 function download(){if(!advice)return;
  const payload={...advice,comparison,createdAt:new Date().toISOString()};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download='sonic-v778-quality-advice.json';link.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 const headingStyle={fontWeight:700} as const;
 return <main style={{padding:20,maxWidth:1050,margin:'0 auto',fontFamily:'system-ui'}} data-v778-quality-advisor>
  <h1>V778 · Concert Performance Quality Advisor</h1>
  <p>V777-Messberichte lokal auswerten. Die Analyse arbeitet ausschließlich mit hochgeladenen JSON-Dateien im Browser – <strong>kein Netzwerk-Upload, kein weiterer WebGL-Renderer und keine erfundenen FPS-Werte</strong>.</p>
  <p>Erstelle zuerst unter <a href="/diagnostics/concert-benchmark?concertBenchV777=1">V777 GLB-Konzertbenchmark</a> oder mit <code>npm run benchmark:v777:browser</code> einen echten Bericht.</p>
  <div style={{display:'flex',gap:18,flexWrap:'wrap',alignItems:'end',padding:'14px 0'}}>
   <label style={{display:'grid',gap:6}}>V777-Bericht (JSON, erforderlich)
    <input type="file" accept=".json,application/json" onChange={e=>void load(e.currentTarget.files?.[0],'current')}/>
   </label>
   <label style={{display:'grid',gap:6}}>Älterer Bericht (optional, Vergleich)
    <input type="file" accept=".json,application/json" onChange={e=>void load(e.currentTarget.files?.[0],'baseline')}/>
   </label>
   <label style={{display:'grid',gap:6}}>Gewünschtes FPS-Ziel
    <select value={target} onChange={e=>setTarget(Number(e.target.value) as TargetFpsV778)}>
     <option value={30}>30 FPS</option><option value={45}>45 FPS</option><option value={60}>60 FPS</option>
    </select>
   </label>
  </div>
  {message&&<p role="status">{message}</p>}
  {!advice&&<p role="status">Noch kein Bericht geladen. Erst nach einer echten Messung können Qualitätsprofile empfohlen werden.</p>}
  {advice?.status==='blocked'&&<section role="alert"><h2>Bericht nicht auswertbar</h2>
   <ul>{advice.issues.map((item,i)=><li key={i}>{item}</li>)}</ul>
   <p>Es wird keine Qualitäts- oder Hardwareempfehlung erzeugt.</p></section>}
  {advice?.status==='ready'&&<>
   <h2>Gemessene Szenen · {target} FPS Ziel</h2>
   <p><strong>{advice.source.label}</strong> · {advice.source.viewport} · {advice.source.mode==='reference'?'Referenz-GLB':'Eigene GLB-Assets'} · {advice.source.renderer}</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
    {advice.groups.map(g=><section key={g.avatars} style={{border:'1px solid currentColor',borderRadius:8,padding:12}}>
     <h3 style={headingStyle}>{g.avatars} GLB-Avatare</h3>
     <p><strong>{g.targetReached?'FPS-Ziel in der Fixture erreicht':'FPS-Ziel nicht durchgehend erreicht'}</strong></p>
     <p>Niedrigste FPS: {format(g.minFps)} | Schlechteste P95: {format(g.maxP95Ms)} ms</p>
     <p>Engste Bühne: {g.worstStage} | Profilversuch: {g.recommendedQuality}</p>
    </section>)}
   </div>
   <div style={{overflowX:'auto',margin:'16px 0'}}><table style={{width:'100%',borderCollapse:'collapse'}}>
    <thead><tr>{['Bühne','GLBs','FPS','P95 ms','P95-Reserve','Draw Calls','Ziel'].map(h=><th key={h} scope="col" style={{textAlign:'left',padding:7,borderBottom:'1px solid currentColor'}}>{h}</th>)}</tr></thead>
    <tbody>{advice.cases.map(s=><tr key={s.id}>
     <td style={{padding:7}}>{s.stage}</td><td style={{padding:7}}>{s.avatars}</td>
     <td style={{padding:7}}>{format(s.fps)}</td><td style={{padding:7}}>{format(s.p95Ms)}</td>
     <td style={{padding:7}}>{format(s.frameBudgetMarginMs)} ms</td><td style={{padding:7}}>{format(s.drawCalls,0)}</td>
     <td style={{padding:7}}>{s.targetReached?'Erreicht':'Verfehlt'}</td>
    </tr>)}</tbody></table></div>
   <h2>Empfehlung – nicht automatisch angewendet</h2>
   <p>{advice.recommendedAvatars===null?'Keine getestete Avatarzahl erreicht das Ziel auf allen Bühnen.':
     `Bis zu ${advice.recommendedAvatars} GLB-Avatare erreichen in dieser Fixture das Ziel. Profil zum Nachtesten: ${advice.recommendedQuality}.`}</p>
   <ul>{advice.recommendations.map((s,i)=><li key={i}>{s}</li>)}</ul>
   <h3>Hardwareeinschätzung</h3><p>{advice.hardwareVerdict}</p>
   <h3>Aussagegrenzen</h3><ul>{advice.notes.map((s,i)=><li key={i}>{s}</li>)}</ul>
   {comparison&&<section>
    <h2>Vorher-nachher-Vergleich</h2>
    <p><strong>{comparison.status==='comparable'?'Streng vergleichbare Messläufe':'Nicht vergleichbar'}</strong> – {comparison.summary}</p>
    {comparison.warnings.map((s,i)=><p key={i}>{s}</p>)}
   </section>}
   {baseline!==null&&!comparison&&<p role="status">Der ältere Bericht ist unvollständig oder nicht als gültige V777-Messung auswertbar; Vergleich nicht verfügbar.</p>}
   <button type="button" onClick={download}>Beratung als JSON exportieren</button>
  </>}
 </main>;
}
