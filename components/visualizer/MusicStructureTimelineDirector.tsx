"use client";
import {useEffect,useMemo,useState} from "react";
import {MUSIC_STRUCTURE_TIMELINE_EVENT,appendTimelineObservation,type TimelineObservation,type TimelineSegment} from "./musicStructureTimeline";
const colors:Record<string,string>={verse:"#547bb2",build:"#e0a13e",drop:"#eb5464",break:"#738d80"};
export function MusicStructureTimelineDirector({avatarId}:{avatarId:string}) {
 const [segments,setSegments]=useState<TimelineSegment[]>([]);
 const [enabled,setEnabled]=useState(false);
 useEffect(()=>{setSegments([]);},[avatarId]);
 useEffect(()=>{
  if(!enabled)return;
  const listener=(event:Event)=>{
   const obs=(event as CustomEvent<TimelineObservation>).detail;
   if(obs && obs.avatarId===avatarId)setSegments(old=>appendTimelineObservation(old,obs));
  };
  window.addEventListener(MUSIC_STRUCTURE_TIMELINE_EVENT,listener);
  return()=>window.removeEventListener(MUSIC_STRUCTURE_TIMELINE_EVENT,listener);
 },[avatarId,enabled]);
 const displayed=useMemo(()=>segments.slice(-20),[segments]);
 const last=displayed[displayed.length-1];
 return <fieldset aria-label="Music Structure Timeline Director V208" style={{minWidth:0}}>
  <legend>Music Structure Timeline Director · V208</legend>
  <p>Live-Diagnose der geschätzten Songstruktur und der automatischen Motion-Auswahl. Keine historische Songanalyse.</p>
  <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>{setEnabled(e.target.checked);setSegments([]);}}/> Live-Timeline aufzeichnen (nur im geöffneten Panel)</label>
  <button type="button" onClick={()=>setSegments([])}>Timeline zurücksetzen</button>
  {!enabled?<p>Aktivieren, um Live-Beobachtungen zu sammeln.</p>:!displayed.length?<p>Warte auf Live-Avatar-Audiodaten für diesen Charakter …</p>:<>
   <div role="img" aria-label="Verlauf aus Verse, Build-up, Drop und Break" style={{display:"flex",minHeight:42,width:"100%",overflow:"hidden",borderRadius:6,margin:"12px 0"}}>
    {displayed.map((s,i)=><div title={`${s.phase} · ${s.motion} · ${s.reason}`} key={`${s.at}-${i}`} style={{flex:Math.max(1,s.until-s.at),background:colors[s.phase],minWidth:4,opacity:0.85}}/>)}
   </div>
   <p><strong>Aktuell:</strong> {last.phase.toUpperCase()} · Motion: {last.motion||"Standard"} · Konfidenz: {Math.round(last.evidence.confidence*100)}%</p>
   <p aria-live="polite"><strong>Entscheidungsgrund:</strong> {last.reason}</p>
   <div style={{maxHeight:190,overflowY:"auto"}}><table style={{width:"100%",fontSize:12}}><thead><tr><th>Phase</th><th>Motion</th><th>Grund</th></tr></thead><tbody>
    {displayed.slice().reverse().map((s,i)=><tr key={`${s.at}-${i}`}><td>{s.phase}</td><td>{s.motion||"Standard"}</td><td>{s.reason}</td></tr>)}
   </tbody></table></div>
  </>}
  <small>Die Phasen sind lokale Heuristiken und keine von Spotify gelieferten Songabschnitte. Break wird erst nach anhaltend geringer Energie, Kick- und Bassaktivität geschätzt. Daten bleiben im Arbeitsspeicher und werden nicht übertragen.</small>
 </fieldset>;
}
