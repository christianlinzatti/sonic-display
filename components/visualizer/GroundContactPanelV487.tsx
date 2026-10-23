"use client";
import {useEffect,useState} from 'react';
import {GROUND_CONTACT_REPORT_EVENT_V487,type GroundContactReportV487} from './groundContactStudioV487';
/** Read-only display: does not request IK, motion or GPU polling itself. */
export function GroundContactStudioV487(){
 const [report,setReport]=useState<GroundContactReportV487|null>(null);
 const [history,setHistory]=useState<number[]>([]);
 useEffect(()=>{
  const onReport=(ev:Event)=>{
   const next=(ev as CustomEvent<GroundContactReportV487>).detail;
   if(!next||!Array.isArray(next.slots))return;
   setReport(next);
   setHistory(old=>[...old.slice(-39),Math.max(0,...next.slots.map(s=>s.driftCm))]);
  };
  window.addEventListener(GROUND_CONTACT_REPORT_EVENT_V487,onReport);
  return()=>window.removeEventListener(GROUND_CONTACT_REPORT_EVENT_V487,onReport);
 },[]);
 const descriptions={unavailable:'Nicht messbar',airborne:'Kein sicherer Stand',stable:'Stabil',watch:'Beobachten',drifting:'Mögliche Fußverschiebung'} as const;
 return <fieldset className="stage-director-v287 ground-contact-studio-v487">
  <legend>Realistic Ground Contact Studio · V487</legend>
  <p>Live-Vorschau der <strong>geschätzten</strong> Fußkontakt-Abweichung je GLB-Avatar. Nutzt die bereits laufende Foot-IK, ohne zusätzliches 3D-Rendering oder eine zweite Messschleife.</p>
  {report&&report.count>0?<>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10}}>
    {report.slots.map((slot,i)=><div key={i} style={{border:'1px solid currentColor',borderRadius:8,padding:10}}>
     <strong>Avatar {i+1}</strong>
     <p role="status" style={{margin:'6px 0'}}>{descriptions[slot.status]}</p>
     <div style={{display:'flex',gap:10,alignItems:'center'}} aria-label={`Avatar ${i+1}: Fußkontakt links und rechts`}>
      <span title="Linker Fuß" style={{fontSize:22,opacity:slot.support==='left'||slot.support==='both'?1:.28}}>◖</span>
      <span title="Rechter Fuß" style={{fontSize:22,opacity:slot.support==='right'||slot.support==='both'?1:.28}}>◗</span>
      <span style={{fontSize:12}}>Kontakt: {slot.support==='both'?'beidseitig':slot.support==='left'?'links':slot.support==='right'?'rechts':'keiner'}</span>
     </div>
     <small>Drift-Schätzung: {slot.status==='unavailable'?'–':`${slot.driftCm.toFixed(1)} cm`} · Konfidenz {Math.round(slot.confidence*100)} %</small>
     {slot.travelMultiplier<1&&<p style={{fontSize:12}}>Automatische Schrittverschiebung gebremst ({Math.round(slot.travelMultiplier*100)} %)</p>}
    </div>)}
   </div>
   <div style={{marginTop:10}}><strong>Kurzer Messverlauf</strong>
    <div role="img" aria-label="Letzte maximal 40 Schätzwerte, jeweils größte gemeldete Fußverschiebung" style={{display:'flex',alignItems:'end',gap:2,height:42,paddingTop:4}}>
      {history.map((v,i)=><div key={i} title={`${v.toFixed(1)} cm`} style={{flex:1,minWidth:2,height:`${Math.max(2,Math.min(100,v/8*100))}%`,background:'currentColor',opacity:.25+Math.min(.7,v/8)}}/>)}
    </div>
   </div>
  </>:<p role="status">Noch keine IK-Messungen. Starte eine 3D-Gruppenshow mit GLB-Avataren und aktiver Foot-IK.</p>}
  <button type="button" onClick={()=>{setHistory([]);setReport(null);}}>Anzeige zurücksetzen</button>
  <small>Die Werte sind modellbezogene Schätzungen aus Knöchelposition und Standanker, keine gemessene reale Fußsohlenreibung oder Kollision. Ohne geeignetes Rig/Foot-IK bleiben sie unverfügbar. Der Verlauf liegt nur im Arbeitsspeicher; bei Seek, Trackwechsel und Pause kann die Anzeige kurz neu starten. Keine automatische Änderung deiner GLB-Clips.</small>
 </fieldset>;
}
