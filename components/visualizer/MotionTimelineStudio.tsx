"use client";
import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import {useMusic} from "@/context/MusicContext";
import {readTrackAnalysisV318,ANALYSIS_EVENT_V318,ANALYSIS_STORAGE_KEY_V318,type TrackAnalysisV318} from "@/services/musicAnalysis/trackAnalysisV318";
import {MusicAlignedTimelineEditorV319} from "./MusicAlignedTimelineEditorV319";
import {timelineSongSecondsV319} from "./musicMotionTimelineV319";
const MotionTimelinePreview3DV319=dynamic(()=>import("./MotionTimelinePreview3DV319").then(m=>m.MotionTimelinePreview3DV319),{ssr:false});
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import { VisualKeyframeCurveEditor } from "./VisualKeyframeCurveEditor";
import { ChoreographyQualityStudio } from "./ChoreographyQualityStudio";
import { AIChoreographyComposer } from "./AIChoreographyComposer";
import { RapFlowBeatGrooveStudio } from "./RapFlowBeatGrooveStudio";
import { AdaptiveGenreDanceStudio } from "./AdaptiveGenreDanceStudio";
import { MusicStructureAnalyzerStudio } from "./MusicStructureAnalyzerStudio";
import { sanitizeTimeline, timelineDuration, timelineWeights, snapToBeat, type TimelineSegment } from "./motionTimelineEngine";
export function MotionTimelineStudio({modelUrl,animationUrl}:{modelUrl:string|null;animationUrl?:string}) {
 const {preferences,updatePreferences}=useUiPreferences(); const [clips,setClips]=useState<string[]>([]);const [playhead,setPlayhead]=useState(0);const [jsonError,setJsonError]=useState("");
 const timeline=sanitizeTimeline(preferences.avatarTimeline); const enabled=preferences.avatarTimelineEnabled??false;
 useEffect(()=>{let active=true;setClips([]);if(!modelUrl)return;const loader=new GLTFLoader();Promise.all([loader.loadAsync(modelUrl),animationUrl?loader.loadAsync(animationUrl):Promise.resolve(null)]).then(([a,b])=>{if(active)setClips([...a.animations.map(x=>x.name),...(b?.animations||[]).map(x=>`Imported: ${x.name}`)]);}).catch(()=>{});return()=>{active=false;};},[modelUrl,animationUrl]);
 const {track,progressMs,isPlaying}=useMusic();
 const activeTrackId=track?.id??"";
 const [analysis,setAnalysis]=useState<TrackAnalysisV318|null>(null);
 const [followSong,setFollowSong]=useState(false);
 const [playingPreview,setPlayingPreview]=useState(false);
 const [showPreview,setShowPreview]=useState(false);
 const raf=useRef<number|undefined>(undefined);
 useEffect(()=>{
   const sync=()=>setAnalysis(readTrackAnalysisV318(activeTrackId));sync();
   window.addEventListener(ANALYSIS_EVENT_V318,sync);
   const storage=(event:StorageEvent)=>{if(event.key===ANALYSIS_STORAGE_KEY_V318)sync();};
   window.addEventListener('storage',storage);
   return()=>{window.removeEventListener(ANALYSIS_EVENT_V318,sync);window.removeEventListener('storage',storage);};
 },[activeTrackId]);
 const bpm=timeline.bpm??120; const snap=timeline.snap!==false;
 const quant=(value:number)=>Math.round(snapToBeat(value,bpm,snap)*1000)/1000;
 const save=(segments:TimelineSegment[])=>updatePreferences({avatarTimeline:{...timeline,segments}});
 const update=(id:string,patch:Partial<TimelineSegment>)=>save(timeline.segments.map(s=>s.id===id?{...s,...patch}:s));
 useEffect(()=>{if(followSong){const time=timelineSongSecondsV319(0,timeline.trackId||activeTrackId,activeTrackId,progressMs,true);if(time!==null)setPlayhead(time);}},[followSong,progressMs,activeTrackId,timeline.trackId]);
 useEffect(()=>{
   if(!playingPreview||followSong)return;
   let last=0;
   const animate=(stamp:number)=>{
     if(last){const dt=Math.min(.1,(stamp-last)/1000);setPlayhead(old=>{const end=Math.max(1,timelineDuration(timeline));return timeline.loop?(old+dt)%end:Math.min(end,old+dt);});}
     last=stamp;raf.current=requestAnimationFrame(animate);
   };
   raf.current=requestAnimationFrame(animate);
   return()=>{if(raf.current!==undefined)cancelAnimationFrame(raf.current);};
 },[playingPreview,followSong,preferences.avatarTimeline]);
 const duration=timelineDuration(timeline);const live=timelineWeights(timeline,playhead);
 return <><RapFlowBeatGrooveStudio/><AdaptiveGenreDanceStudio clips={clips}/><AIChoreographyComposer clips={clips}/><ChoreographyQualityStudio/><MusicStructureAnalyzerStudio clips={clips}/><fieldset><legend>Advanced Choreography Sequencer Studio · V110</legend>
 <p>Baue aus mehreren Clips eine Sequenz mit Überblendungen und Gewichts-Keyframes. Der Editor verwendet Sekunden seit Beginn der Sequenz.</p>
 <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e=>updatePreferences({avatarTimelineEnabled:e.target.checked})}/> Timeline live statt Smart Dance Director/Choreografie abspielen</label>
 <label>Name<input value={timeline.name} onChange={e=>updatePreferences({avatarTimeline:{...timeline,name:e.target.value}})}/></label>
 <label className="setting-check"><input type="checkbox" checked={timeline.loop} onChange={e=>updatePreferences({avatarTimeline:{...timeline,loop:e.target.checked}})}/> Sequenz wiederholen</label>
 <div style={{display:"flex",flexWrap:"wrap",gap:12,alignItems:"center"}}>
 <label>Musiktempo (BPM)<input type="number" min="40" max="240" step="1" value={bpm} onChange={e=>updatePreferences({avatarTimeline:{...timeline,bpm:Math.max(40,Math.min(240,Number(e.target.value)||120))}})}/></label>


 </div>
 <p><small>Die bestehende Sequenz bleibt erhalten; importierte Beat-/Taktmarkierungen gelten nur für den aktuell ausgewählten Titel. Das optionale Live-Song-Sync wirkt erst nach Aktivierung.</small></p>
 <MusicAlignedTimelineEditorV319 timeline={timeline} trackId={activeTrackId} analysis={analysis} playhead={playhead} onSeek={seconds=>{setPlayingPreview(false);setPlayhead(seconds);}} onChange={next=>updatePreferences({avatarTimeline:next})}/>
 <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
   <button type="button" disabled={followSong||!duration} onClick={()=>setPlayingPreview(value=>!value)}>{playingPreview?'Vorschau pausieren':'Vorschau abspielen'}</button>
   <button type="button" onClick={()=>{setPlayingPreview(false);setPlayhead(0);}}>Zurück zum Anfang</button>
   <label className="setting-check"><input type="checkbox" checked={followSong} disabled={!activeTrackId} onChange={e=>{setFollowSong(e.target.checked);setPlayingPreview(false);}}/> Spielposition des Spotify-Titels verfolgen {isPlaying?'(läuft)':'(pausiert)'}</label>
   <label className="setting-check"><input type="checkbox" checked={showPreview} onChange={e=>setShowPreview(e.target.checked)}/> Synchronisierte 3D-Vorschau anzeigen</label>
 </div>
 {showPreview&&<MotionTimelinePreview3DV319 modelUrl={modelUrl} animationUrl={animationUrl} timeline={timeline} seconds={playhead}/>}
 <label>Vorschau-Zeit: {playhead.toFixed(1)} s / {duration.toFixed(1)} s<input aria-label="Timeline abtasten" type="range" min="0" max={Math.max(.1,duration,analysis?.durationMs?analysis.durationMs/1000:0)} step="0.1" value={Math.min(playhead,Math.max(.1,duration,analysis?.durationMs?analysis.durationMs/1000:0))} onChange={e=>setPlayhead(Number(e.target.value))}/></label>
 <div style={{height:18,background:"#242735",position:"relative",borderRadius:5,overflow:"hidden"}}>{timeline.segments.map((s,i)=><div key={s.id} title={`${s.clip}: ${s.start.toFixed(1)}–${(s.start+s.duration).toFixed(1)} s`} style={{position:"absolute",left:`${100*s.start/Math.max(.1,duration)}%`,width:`${100*s.duration/Math.max(.1,duration)}%`,height:"100%",background:i%2?"#ce7cff":"#61d8e7",opacity:.75,border:"1px solid #111"}}/>)}<div style={{position:"absolute",left:`${100*playhead/Math.max(.1,duration)}%`,height:"100%",borderLeft:"2px solid white"}}/></div>
 {timeline.segments.map((s,i)=><fieldset key={s.id}><legend>Clip {i+1} · {live[s.clip]?`${Math.round(live[s.clip]*100)} % aktiv`:"inaktiv"}</legend>
 <label>Spur<select value={s.track??0} onChange={e=>update(s.id,{track:Number(e.target.value)})}>{Array.from({length:8},(_,i)=><option key={i} value={i}>Spur {i+1}</option>)}</select></label>
 <label>Beat-Position (BPM-Fallback)<input type="number" min="0" step="1" value={Math.round(s.start/(60/bpm))} onChange={e=>update(s.id,{start:Math.max(0,Number(e.target.value))*(60/bpm)})}/></label>
 <label>Clip<select value={s.clip} onChange={e=>update(s.id,{clip:e.target.value})}><option value="">Wählen…</option>{clips.map((name,j)=><option key={j} value={name}>{name}</option>)}</select></label>
 {(["start","duration","fadeIn","fadeOut","speed"] as const).map(key=><label key={key}>{({start:"Start (s)",duration:"Länge (s)",fadeIn:"Einblenden (s)",fadeOut:"Ausblenden (s)",speed:"Tempo (×)"})[key]}<input type="number" min={key==="speed"?.25:0} max={key==="speed"?3:3600} step={key==="speed"?.05:.1} value={s[key]} onChange={e=>update(s.id,{[key]:key==="start"?quant(Number(e.target.value)):Number(e.target.value)})}/></label>)}
 <label>Übergangskurve<select value={s.curve} onChange={e=>update(s.id,{curve:e.target.value as TimelineSegment["curve"]})}>{["smooth","linear","ease-in","ease-out","bezier"].map(c=><option key={c} value={c}>{c}</option>)}</select></label>
 <label>Gewichts-Keyframes (Sekunde:Gewicht, z. B. 0:0.2,2:1)<input value={s.keys.map(k=>`${k.at}:${k.value}`).join(",")} onChange={e=>{const keys=e.target.value.split(",").map(pair=>pair.split(":").map(Number)).filter(pair=>pair.length===2&&pair.every(Number.isFinite)).map(([at,value])=>({at,value}));update(s.id,{keys});}} /></label>
 <VisualKeyframeCurveEditor segment={s} onChange={patch=>update(s.id,patch)}/>
 <button type="button" onClick={()=>save(timeline.segments.filter(x=>x.id!==s.id))}>Spur löschen</button></fieldset>)}
 <button type="button" disabled={!clips.length} onClick={()=>{const last=timeline.segments.at(-1);save([...timeline.segments,{id:`${Date.now()}-${timeline.segments.length}`,clip:clips[0],track:last?.track??0,start:quant(last?last.start+Math.max(.1,last.duration-.5):0),duration:4,fadeIn:.5,fadeOut:.5,speed:1,curve:"smooth",keys:[]}]);}}>+ Clip hinzufügen</button>{" "}
 <button type="button" disabled={!clips.length} onClick={()=>save([...timeline.segments,{id:`at-${Date.now()}`,clip:clips[0],track:0,start:Math.max(0,playhead),duration:4,fadeIn:.35,fadeOut:.35,speed:1,curve:"smooth",keys:[]}])}>+ Clip an Vorschau-Position</button>{" "}
 <button type="button" onClick={()=>{const blob=new Blob([JSON.stringify(timeline,null,2)],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="sonic-motion-timeline.json";link.click();URL.revokeObjectURL(link.href);}}>JSON exportieren</button>{" "}
 <label>JSON importieren<input type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{const raw=JSON.parse(await file.text());updatePreferences({avatarTimeline:sanitizeTimeline(raw)});setJsonError("");}catch{setJsonError("Ungültiges JSON");}e.target.value="";}}/></label>
 {jsonError&&<small role="alert">{jsonError}</small>}
 <small>Die Live-Timeline startet mit Beginn des Musik-Playbacks, wenn der 3D-Avatar aktiv ist. Änderungen und Clips werden in den Einstellungen des Browsers gespeichert. Clip-Namen müssen zum gewählten Avatar passen.</small>
 </fieldset></>;
}
