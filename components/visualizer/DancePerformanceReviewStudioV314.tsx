"use client";
import {useEffect,useMemo,useState} from 'react';
import {clearReviewV314,isRecordingV314,reviewCsvV314,setRecordingV314,snapshotReviewV314,type ReviewSnapshotV314,type ReviewSampleV314} from './dancePerformanceReviewV314';

const duration=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
const pct=(number:number|null)=>number===null?'—':`${Math.round(number*100)} %`;
const empty=():ReviewSnapshotV314=>({trackId:'',trackLabel:'',durationMs:0,recording:true,samples:[],summary:{sampleCount:0,durationMs:0,cameraChanges:0,cameraVariety:0,averageBeatResponse:null,averageMovement:null,averageFootImpulse:null,phaseConfidence:null,suggestions:[]}});
function TrendV314({samples}:{samples:ReviewSampleV314[]}){
  const slice=samples.length>150?samples.slice(-150):samples;
  if(slice.length<2)return <p>Noch keine ausreichenden Messpunkte für den Verlauf.</p>;
  const start=slice[0].atMs,end=slice[slice.length-1].atMs,span=Math.max(1,end-start);
  const points=(select:(sample:ReviewSampleV314)=>number|null)=>slice.filter(s=>select(s)!==null).map(s=>`${(16+(s.atMs-start)/span*612).toFixed(1)},${(108-(select(s)??0)*90).toFixed(1)}`).join(' ');
  return <div className="dance-review-v314-chart">
    <svg viewBox="0 0 645 128" role="img" aria-label="Live-Verlauf von Musikenergie, zusätzlicher Tanzbewegung und automatischen Effekten. Fehlende Messwerte werden ausgelassen." preserveAspectRatio="none">
      <line x1="16" x2="628" y1="108" y2="108" stroke="currentColor" strokeOpacity="0.27" />
      <line x1="16" x2="628" y1="63" y2="63" stroke="currentColor" strokeOpacity="0.12" />
      <polyline points={points(s=>s.energy)} fill="none" stroke="#06b6d4" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polyline points={points(s=>s.movement)} fill="none" stroke="#a78bfa" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <polyline points={points(s=>s.fx)} fill="none" stroke="#f59e0b" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
    </svg>
    <div className="dance-review-v314-ticks"><small>{duration(start)}</small><small>{duration(end)}</small></div>
    <div className="dance-review-v314-legend"><span><i className="review-energy"/> Musikenergie</span><span><i className="review-motion"/> Zusatzbewegung</span><span><i className="review-fx"/> Show-FX</span></div>
  </div>;
}
function downloadReport(name:string,content:string,mime:string){
  const blob=new Blob([content],{type:mime});const href=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=href;a.download=name;document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(href),1000);
}
export function DancePerformanceReviewStudioV314(){
  const [data,setData]=useState<ReviewSnapshotV314>(empty);
  const [last60,setLast60]=useState(false);
  useEffect(()=>{
    const sync=()=>setData(snapshotReviewV314());sync();
    const timer=window.setInterval(sync,1600);
    return ()=>window.clearInterval(timer);
  },[]);
  const viewed=useMemo(()=>{
    if(!last60||!data.samples.length)return data;
    const cutoff=data.samples[data.samples.length-1].atMs-60_000;
    return {...data,samples:data.samples.filter(s=>s.atMs>=cutoff)};
  },[data,last60]);
  const total=data.summary;
  const hints=last60?viewed.samples.length>0?data.summary.suggestions.filter(s=>s.atMs>=viewed.samples[0].atMs):[]:total.suggestions;
  return <fieldset className="stage-director-v287 dance-review-v314"><legend>Dance Performance Review Studio · V314</legend>
    <p>Live-Auswertung der laufenden Show: musikalische Energie, tatsächlich berechnete zusätzliche Rig-Bewegungen, Kamerawechsel, Effekte und auffällige Passagen.</p>
    <div className="dance-review-v314-actions">
      <button type="button" onClick={()=>{setRecordingV314(!isRecordingV314());setData(snapshotReviewV314());}} aria-pressed={data.recording}>{data.recording?'Aufzeichnung pausieren':'Aufzeichnung fortsetzen'}</button>
      <button type="button" disabled={!data.samples.length} onClick={()=>{clearReviewV314();setData(snapshotReviewV314());}}>Session zurücksetzen</button>
      <button type="button" disabled={!data.samples.length} onClick={()=>downloadReport('sonic-dance-review-v314.csv',reviewCsvV314(data),'text/csv;charset=utf-8')}>CSV exportieren</button>
      <button type="button" disabled={!data.samples.length} onClick={()=>downloadReport('sonic-dance-review-v314.json',JSON.stringify(data,null,2),'application/json')}>JSON exportieren</button>
    </div>
    <small role="status" aria-live="polite">{data.trackId?`${data.trackLabel||'Aktueller Song'} · ${data.samples.length} Messpunkte · ${data.recording?'zeichnet auf':'pausiert'}`:'Noch keine laufende Show aufgezeichnet.'}</small>
    <div className="dance-review-v314-scores">
      <div><small>Beat-Reaktion (Proxy)</small><strong>{pct(total.averageBeatResponse)}</strong></div>
      <div><small>Zusatzbewegung</small><strong>{pct(total.averageMovement)}</strong></div>
      <div><small>Fußimpulse bei Kontakt</small><strong>{pct(total.averageFootImpulse)}</strong></div>
      <div><small>Kameraperspektiven</small><strong>{total.cameraVariety}</strong></div>
      <div><small>Automatische Schnitte</small><strong>{total.cameraChanges}</strong></div>
      <div><small>Beat-Lock-Vertrauen</small><strong>{pct(total.phaseConfidence)}</strong></div>
    </div>
    <label className="setting-check"><input type="checkbox" checked={last60} onChange={e=>setLast60(e.target.checked)} /> Nur die letzten 60 Sekunden anzeigen</label>
    <TrendV314 samples={viewed.samples}/>
    <div className="dance-review-v314-insights">
      <strong>Hinweise zur Show</strong>
      {hints.length?<ul>{hints.slice(-6).map((item,i)=><li key={`${item.type}-${item.atMs}-${i}`}><strong>{duration(item.atMs)}</strong> · {item.message}</li>)}</ul>:<p>Keine auffälligen Kamera-, Effekt- oder Fußkontakt-Muster im bisherigen Verlauf. Das ist keine Garantie für perfekte Bewegungen.</p>}
    </div>
    <small>Die Werte sind <strong>Diagnose-Indikatoren, keine objektive Qualitätsnote</strong>. Beat-Reaktion vergleicht zusätzliche Rig-Bewegung mit erkannten Kick-Peaks; ohne echte Mikrofon-/Beat-Lock-Daten kann die Beatgenauigkeit nicht gemessen werden. Die Fußkennzahl beschreibt nur additive Fußimpulse bei Kontakt, nicht echtes Rutschen eines GLB-Fußes. Im manuellen Modus oder ohne 3D-Avatar können Messwerte fehlen. Alle Daten bleiben im Arbeitsspeicher dieser Browser-Session, maximal 480 Messpunkte pro Songsegment; keine Übertragung oder dauerhafte Speicherung.</small>
  </fieldset>;
}
