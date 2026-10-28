"use client";
/** V646: opt-in, read-only concert-score overlay. No renderer/animation loop, no audio, no uploads. */
import {useEffect,useMemo,useState,type CSSProperties} from 'react';
import type {ConcertArcV600,ConcertArcCueV600} from './ultimateConcertDirectorV600';
import type {NarrativePlanV604} from './fullSongConcertDramaturgyV604';
import type {VocalTimeSegmentV496} from './vocalTimeDirectorV496';
import {readTimelineV354,SHOW_TIMELINE_EVENT_V354} from '../../services/stageContent/showTimelineV354';
import {buildConcertTimelineV646,activeConcertItemsV646,exportConcertTimelineV646,
 type ConcertLaneV646} from './intelligentConcertTimelineV646';

const names:Record<ConcertLaneV646,string>={section:'Songabschnitt',camera:'Kameramotif (Plan)',
 formation:'Formation (Plan)',lighting:'Licht / Dramaturgie (Plan)',vocals:'Sänger (manuell)',manual:'Eigene Show-Clips'};
const order:ConcertLaneV646[]=['section','camera','formation','lighting','vocals','manual'];
const palette:Record<ConcertLaneV646,string>={section:'#3b82f6',camera:'#8b5cf6',
 formation:'#06b6d4',lighting:'#eab308',vocals:'#ec4899',manual:'#22c55e'};
const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor((ms%60000)/1000)).padStart(2,'0')}`;
export function IntelligentConcertTimelineV646({trackId,durationMs,progressMs,playing,arc,narrative,confirmed,
 vocal,vocalEnabled,avatarCount}:{trackId:string;durationMs:number;progressMs:number;playing:boolean;
 arc:ConcertArcV600;narrative:NarrativePlanV604;confirmed:ConcertArcCueV600;
 vocal?:readonly VocalTimeSegmentV496[];vocalEnabled:boolean;avatarCount:number}){
 const [open,setOpen]=useState(false);
 const [manual,setManual]=useState(readTimelineV354);
 useEffect(()=>{const refresh=()=>setManual(readTimelineV354());window.addEventListener(SHOW_TIMELINE_EVENT_V354,refresh);
   return ()=>window.removeEventListener(SHOW_TIMELINE_EVENT_V354,refresh);},[]);
 useEffect(()=>{setOpen(false);},[trackId]);
 const plan=useMemo(()=>buildConcertTimelineV646({trackId,durationMs,arc,narrative,manual,
   vocal,vocalEnabled,maxAvatars:avatarCount}),[trackId,durationMs,arc,narrative,manual,vocal,vocalEnabled,avatarCount]);
 const current=activeConcertItemsV646(plan,trackId,progressMs);
 const currentConfirmed=playing&&confirmed.active&&confirmed.source==='authored'&&
  current.some(x=>x.lane==='section'&&x.act===confirmed.act);
 const exportJson=()=>{
  if(!plan.durationMs)return;
  const url=URL.createObjectURL(new Blob([exportConcertTimelineV646(plan)],{type:'application/json'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='sonic-concert-timeline-v646.json';
  document.body.append(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 // Only the compact toggle is visible by default. Avoid obstructing readable lyrics.
 const container:CSSProperties={position:'absolute',left:12,bottom:12,zIndex:16,maxWidth:'min(94vw,790px)',
  width:open?'min(94vw,790px)':'auto',pointerEvents:'auto',color:'#f5f8ff',fontSize:12};
 const control:CSSProperties={background:'#172338',color:'#f5f8ff',border:'1px solid #667a9b',
  padding:'8px 11px',borderRadius:7,cursor:'pointer',fontSize:13};
 const panel:CSSProperties={background:'rgba(11,19,32,.98)',border:'1px solid #60718b',borderRadius:9,
  padding:12,maxHeight:'min(65vh,520px)',overflowY:'auto',boxShadow:'0 9px 35px #000a'};
 return <div style={container} data-v646-timeline={open?'open':'closed'}>
  <button type="button" style={control} aria-expanded={open} aria-controls="sonic-concert-timeline-v646"
   onClick={()=>setOpen(v=>!v)}>{open?'Zeitplan schließen':'Regie-Zeitplan'}</button>
  {open&&<div id="sonic-concert-timeline-v646" style={panel} role="region" aria-label="V646 Konzertregie-Zeitplan">
   <p style={{margin:'0 0 8px'}}>V646 · Intelligent Concert Timeline · {time(progressMs)} / {time(plan.durationMs)}</p>
   <p style={{margin:'0 0 8px'}}>{plan.notice} {currentConfirmed?'Aktueller Abschnitt live bestätigt.':'Live-Abgleich nicht bestätigt; Zeitplan ist eine Vorschau.'}</p>
   {!plan.durationMs?<p>Kein gültiger Song oder keine Songdauer vorhanden.</p>:<>
    <div role="img" aria-label={`Position ${time(progressMs)} von ${time(plan.durationMs)}`}
     style={{height:5,background:'#3a4a62',borderRadius:5,margin:'10px 0 13px'}}>
     <div style={{height:'100%',width:`${Math.min(100,Math.max(0,progressMs/plan.durationMs*100))}%`,background:'#bcecff',borderRadius:5}}/>
    </div>
    {order.map(lane=>{const clips=plan.items.filter(x=>x.lane===lane);
     return <div key={lane} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',gap:10}}>
      <strong>{names[lane]}</strong><span>{clips.length?`${clips.length} Einträge`:'Keine nachgewiesenen Einträge'}</span></div>
      <div aria-label={names[lane]} style={{height:29,background:'#18253a',position:'relative',borderRadius:5,
       marginTop:4,overflow:'hidden'}}>
       {clips.map(x=>{const selected=current.includes(x);return <div key={x.id} title={`${time(x.startMs)}–${time(x.endMs)} · ${x.label} · ${x.evidence}`}
        aria-label={`${x.label}, ${time(x.startMs)} bis ${time(x.endMs)}`}
        style={{position:'absolute',top:3,bottom:3,left:`${x.startMs/plan.durationMs*100}%`,
         width:`${(x.endMs-x.startMs)/plan.durationMs*100}%`,background:palette[lane],
         border:selected?'2px solid white':'1px solid #172338',boxSizing:'border-box',opacity:selected?1:.72,
         overflow:'hidden',whiteSpace:'nowrap',textOverflow:'clip',fontSize:10,color:'#050b13',padding:'4px 3px'}}>
         {(x.endMs-x.startMs)>plan.durationMs*.075?x.label:''}</div>;})}
       <div aria-hidden="true" style={{position:'absolute',top:0,bottom:0,
        left:`${Math.min(100,Math.max(0,progressMs/plan.durationMs*100))}%`,width:2,background:'#fff',pointerEvents:'none'}}/>
      </div></div>;})}
    <p style={{margin:'8px 0'}}>Aktuell: {current.length?current.map(c=>`${names[c.lane]}: ${c.label}`).join(' · '):'Kein bestätigter Eintrag an dieser Position'}</p>
    <p style={{margin:'5px 0'}}>Nicht abgedeckte Zeitfenster: {plan.gaps.length?plan.gaps.slice(0,5).map(g=>`${time(g.startMs)}–${time(g.endMs)}`).join(', '):'keine'}{plan.gaps.length>5?' …':''}</p>
    <button type="button" style={control} onClick={exportJson}>Zeitplan als JSON exportieren</button>
   </>}
   <p style={{margin:'8px 0 0',opacity:.87}}>Nur Anzeige. Keine Spotify-Steuerung und keine Änderung an Timeline, Kamera, Licht oder Animationen. Sänger nur aus aktiven manuellen Zeitmarken. Automatische Motive sind Vorschläge; die tatsächliche 3D-Wirkung muss geprüft werden.</p>
  </div>}
 </div>;
}
