'use client';
import {useState} from 'react';
import {useConcertQualityV466} from './concertQualityStoreV466';
import {analyzeCaptureV544,captureLiveConcertV544,compareConcertCapturesV544,createComparisonReportV544,
 type SceneCaptureV544,type ManualMarkV544,type VisualReviewV544} from '@/services/show/liveConcertComparisonV544';

const title={unknown:'Keine Daten',good:'Technisch unauffällig',watch:'Prüfen',issue:'Auffällig'} as const;
const labels:{key:keyof VisualReviewV544;label:string}[]=[
 {key:'footwork',label:'Fußkontakt & Tanz'},
 {key:'faces',label:'Mimik & Lip-Sync'},
 {key:'lyrics',label:'Lyrics lesbar'}];

function SceneMapV544({sample,label}:{sample:SceneCaptureV544|null;label:string}) {
 if(!sample)return <p className="settings-note">Noch kein Live-Messpunkt gespeichert.</p>;
 return <svg viewBox="0 0 300 180" role="img" aria-label={`${label}: projizierte Avatarköpfe und Lyrics-Region, keine Aufnahme echter Pixel`}>
  <rect width="300" height="180" fill="#112338" stroke="#9db4c6" rx="8"/>
  <path d="M15 15H285V165H15Z" fill="none" stroke="#6f8ba4" strokeDasharray="4 5"/>
  {sample.lyrics&&<rect x={sample.lyrics.x*300} y={sample.lyrics.y*180}
   width={sample.lyrics.width*300} height={sample.lyrics.height*180}
   fill="#fbbf24" fillOpacity={.19} stroke="#fbbf24" strokeWidth="1.5"/>}
  {sample.heads.map(h=><g key={h.slot}>
   <circle cx={h.x*300} cy={h.y*180} r="11" fill={h.loaded&&h.visible?'#38bdf8':'#fb7185'} stroke={h.estimated?'#fbbf24':'white'} strokeWidth="1.5" strokeDasharray={h.estimated?'2 2':'none'}/>
   <text x={h.x*300} y={h.y*180+4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#041322">{h.slot+1}</text>
  </g>)}
  <text x="150" y="174" fontSize="9" fill="#c2cedb" textAnchor="middle">Schematische Live-Projektion · kein Foto</text>
 </svg>;
}

function RecordedSceneV544({slot,sample,onReview}:{slot:'A'|'B';sample:SceneCaptureV544|null;
 onReview:(key:keyof VisualReviewV544,value:ManualMarkV544)=>void}){
 const result=analyzeCaptureV544(sample);
 return <div className="v544-scene" aria-label={`V544 Probe ${slot}`}>
  <b>Probe {slot} · {title[result.grade]}</b>
  <SceneMapV544 sample={sample} label={`Probe ${slot}`}/>
  {sample&&<>
   <small>{new Date(sample.at).toLocaleTimeString('de-AT')} · FPS {sample.fps===null?'nicht verfügbar':sample.fps.toFixed(1)} · Köpfe {result.visible}/{sample.heads.length}</small>
   <p className="settings-note">Bildrand: {result.nearEdge} · Lyrics-Nähe: {result.nearLyrics}</p>
   {labels.map(({key,label})=><label key={key} className="v544-review-row">{label}
    <select value={sample.review[key]} aria-label={`Probe ${slot} ${label}`} onChange={e=>onReview(key,e.target.value as ManualMarkV544)}>
     <option value="unchecked">Ungeprüft</option><option value="good">Passt</option><option value="issue">Auffällig</option>
    </select></label>)}
   {result.warnings.length>0&&<ul>{result.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul>}
  </>}
 </div>;
}

export function ConcertVisualCompareV544(){
 const live=useConcertQualityV466();
 const [a,setA]=useState<SceneCaptureV544|null>(null),[b,setB]=useState<SceneCaptureV544|null>(null);
 const [notice,setNotice]=useState('');
 const contrast=compareConcertCapturesV544(a,b);
 const capture=(side:'A'|'B')=>{
  const result=captureLiveConcertV544(live,Date.now());
  if(!result){setNotice('Keine aktuelle Live-Messung: aktive GLB-Bühne starten, QA öffnen und eine Sekunde beobachten.');return;}
  if(side==='A')setA(result);else setB(result);
  setNotice(`Probe ${side} aus aktueller WebGL-Projektion übernommen (keine Pixelaufnahme).`);
 };
 const review=(side:'A'|'B',key:keyof VisualReviewV544,value:ManualMarkV544)=>{
  const set=side==='A'?setA:setB;
  set(current=>current?{...current,review:{...current.review,[key]:value}}:current);
 };
 const exportReport=()=>{
  const content=JSON.stringify(createComparisonReportV544(a,b),null,2);
  const blob=new Blob([content],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const el=document.createElement('a');el.href=url;el.download='sonic-v544-visual-comparison.json';el.click();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 return <details className="v544-live-compare">
  <summary>V544 · Live-Show A/B vergleichen</summary>
  <p>Nur auf Knopfdruck: Vergleicht echte projizierte Kopfpositionen, aktives Lyrics-Rechteck und Live-FPS. Die Zeichnung zeigt <b>keine Bildpixel</b> und kann Fußrutschen, Mundbewegung oder Gesichtsverdeckung nicht automatisch erkennen.</p>
  <div className="v544-buttons">
   <button type="button" onClick={()=>capture('A')}>Probe A aufnehmen</button>
   <button type="button" onClick={()=>capture('B')}>Probe B aufnehmen</button>
   <button type="button" onClick={()=>{setA(null);setB(null);setNotice('Vergleich zurückgesetzt.');}}>Zurücksetzen</button>
  </div>
  {notice&&<p role="status">{notice}</p>}
  <div className="v544-compare-grid">
   <RecordedSceneV544 slot="A" sample={a} onReview={(key,val)=>review('A',key,val)}/>
   <RecordedSceneV544 slot="B" sample={b} onReview={(key,val)=>review('B',key,val)}/>
  </div>
  <p role="status"><strong>A/B:</strong> {contrast.message}</p>
  {contrast.status==='comparable'&&<p>Δ FPS: {contrast.fpsDifference===null?'nicht vergleichbar':`${contrast.fpsDifference>0?'+':''}${contrast.fpsDifference}`} · Δ Rand: {contrast.edgeDifference} · Δ Lyrics-Nähe: {contrast.lyricsDifference}</p>}
  <button type="button" disabled={!a&&!b} onClick={exportReport}>Lokal als JSON exportieren</button>
  <p className="v466-quality-disclaimer">A/B-Snapshots bleiben nur im geöffneten UI, bis du zurücksetzt oder die Seite verlässt. Keine automatische Freigabe und keine Übertragung. Für einen echten Bildvergleich nutze zusätzlich Screenshots der laufenden Show.</p>
 </details>;
}
