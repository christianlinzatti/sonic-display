'use client';
import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {useMusic} from '@/context/MusicContext';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {getAvatarModel} from './avatarModels';
import {ANALYSIS_EVENT_V318,readTrackAnalysisV318,type TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {makeMotionGridV319} from './musicMotionTimelineV319';
import {ENSEMBLE_TIMELINE_DEFAULT_V325,evaluateEnsembleTimelineV325,gridMarkersV325,normalizeEnsembleTimelineV325,readEnsembleTimelineV325,
 snapEnsembleSecondV325,updateEnsembleKeyframeV325,writeEnsembleTimelineV325,type EnsembleKeyframeV325,type EnsembleTimelineV325} from './ensembleChoreographyV325';
const Preview=dynamic(()=>import('./EnsemblePreview3DV325').then(x=>x.EnsemblePreview3DV325),{ssr:false});
const roleLabels={'together':'Gemeinsam','lead-solo':'Lead-Solo','partner-solo':'Partner-Solo'} as const;
const formLabels={'line':'Linie','wide':'Breit','diagonal':'Diagonal','close':'Nah'} as const;
const coords={line:[-1,1,0,-.5],wide:[-1.65,1.65,0,0],diagonal:[-1.1,1.1,.45,-.6],close:[-.8,.8,0,-.25]} as const;
export function EnsembleChoreographyStudioV325(){
 const {track,progressMs,isPlaying}=useMusic();
 const {preferences}=useUiPreferences();
 const [settings,setSettings]=useState<EnsembleTimelineV325>(ENSEMBLE_TIMELINE_DEFAULT_V325);
 const [analysis,setAnalysis]=useState<TrackAnalysisV318|null>(null);
 const [seconds,setSeconds]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [followSong,setFollowSong]=useState(false);
 const [show3d,setShow3d]=useState(false);
 const [selected,setSelected]=useState('intro');
 const [error,setError]=useState('');
 const [lastEdit,setLastEdit]=useState<EnsembleTimelineV325|null>(null);
 const drag=useRef<{pointer:number;id:string;origin:number;initial:number;size:number}|null>(null);
 const stageDrag=useRef<{pointer:number;id:string;which:'lead'|'partner'}|null>(null);
 useEffect(()=>{setSettings(readEnsembleTimelineV325());},[]);
 const trackId=track?.id??'';
 useEffect(()=>{const refresh=()=>setAnalysis(readTrackAnalysisV318(trackId));refresh();window.addEventListener(ANALYSIS_EVENT_V318,refresh);return()=>window.removeEventListener(ANALYSIS_EVENT_V318,refresh);},[trackId]);
 useEffect(()=>{if(followSong&&trackId)setSeconds(Math.max(0,progressMs/1000));},[followSong,progressMs,trackId]);
 useEffect(()=>{if(!playing||followSong)return;let last=0;let frame=0;
  const animate=(now:number)=>{if(last){const dt=Math.min(.1,(now-last)/1000);setSeconds(t=>Math.min(3600,t+dt));}last=now;frame=requestAnimationFrame(animate);};
  frame=requestAnimationFrame(animate);return()=>cancelAnimationFrame(frame);
 },[playing,followSong]);
 const horizon=Math.max(24,Math.min(240,Math.ceil((settings.keyframes.at(-1)?.at??0)/8)*8+16));
 const grid=useMemo(()=>makeMotionGridV319(trackId,analysis,settings.bpm,horizon),[trackId,analysis,settings.bpm,horizon]);
 const imported=settings.snap==='beat'?grid.beatSource==='imported':settings.snap==='bar'&&grid.barSource==='imported';
 const markers=useMemo(()=>gridMarkersV325(grid.tempo,grid.timeSignature,horizon,grid.beats,grid.bars,settings.snap),[grid,horizon,settings.snap]);
 const quant=(time:number)=>snapEnsembleSecondV325(time,markers,settings.snap,imported);
 const pose=evaluateEnsembleTimelineV325(settings,seconds);
 const active=settings.keyframes.find(x=>x.id===selected)??settings.keyframes[0];
 const leadModel=getAvatarModel(preferences.avatarModelId);
 const partnerModel=getAvatarModel(preferences.secondaryAvatarModelId??preferences.avatarModelId);
 const change=(next:EnsembleTimelineV325)=>{setLastEdit(settings);setSettings(writeEnsembleTimelineV325(next));setError('');};
 const edit=(id:string,patch:Partial<EnsembleKeyframeV325>)=>change(updateEnsembleKeyframeV325(settings,id,patch));
 const append=()=>{const at=quant(Math.min(3600,Math.max(0,seconds)));
  const last=settings.keyframes.at(-1)??ENSEMBLE_TIMELINE_DEFAULT_V325.keyframes[0];
  const id=`cue-${Date.now().toString(36)}`;
  change({...settings,keyframes:[...settings.keyframes,{...last,id,at,role:'together',drop:false,transition:.75}]});setSelected(id);setSeconds(at);};
 const timelineDown=(e:PointerEvent<HTMLButtonElement>,cue:EnsembleKeyframeV325)=>{
  if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);
  const lane=e.currentTarget.parentElement?.getBoundingClientRect();
  drag.current={pointer:e.pointerId,id:cue.id,origin:e.clientX,initial:cue.at,size:lane?.width||500};setSelected(cue.id);
 };
 const timelineMove=(e:PointerEvent<HTMLButtonElement>)=>{
  const g=drag.current;if(!g||g.pointer!==e.pointerId)return;
  const at=quant(g.initial+(e.clientX-g.origin)/g.size*horizon);
  // Persist only on release to avoid continuous localStorage updates.
  setSeconds(Math.max(0,at));
 };
 const timelineEnd=(e:PointerEvent<HTMLButtonElement>,cancel=false)=>{
  const g=drag.current;if(!g||g.pointer!==e.pointerId)return;drag.current=null;
  if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  if(!cancel){const at=quant(g.initial+(e.clientX-g.origin)/g.size*horizon);edit(g.id,{at});setSeconds(at);}
 };
 const stageSet=(e:PointerEvent<HTMLButtonElement>,which:'lead'|'partner',cue:EnsembleKeyframeV325)=>{
  const stage=e.currentTarget.parentElement?.getBoundingClientRect();if(!stage)return;
  const x=((e.clientX-stage.left)/stage.width-.5)*8;
  const z=((e.clientY-stage.top)/stage.height-.5)*4;
  edit(cue.id,which==='lead'?{leadX:Math.min(-.7,x),leadZ:z}:{partnerX:Math.max(.7,x),partnerZ:z});
 };
 return <fieldset className="ensemble-studio-v325">
  <legend>Advanced Ensemble Choreography Studio · V325</legend>
  <p>Formationen, Solo-Einsätze und gemeinsame Drops für <strong>zwei Tänzer</strong> auf einer gemeinsamen Musik-Timeline gestalten. V324 schützt weiterhin den Bühnenabstand; GLB-Animationen werden nicht überschrieben.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>change({...settings,enabled:e.target.checked})}/> Manuelle Ensemble-Choreografie live aktivieren (hat Vorrang vor automatischer Formation)</label>
  <div className="ensemble-studio-v325-controls">
   <label>Raster <select value={settings.snap} onChange={e=>change({...settings,snap:e.target.value as EnsembleTimelineV325['snap']})}><option value="bar">Takte</option><option value="beat">Beats</option><option value="off">Frei</option></select></label>
   <label>BPM (Fallback) <input type="number" min="40" max="240" value={settings.bpm} onChange={e=>change({...settings,bpm:Number(e.target.value)})}/></label>
   <label className="setting-check"><input type="checkbox" checked={settings.songSync} disabled={!trackId} onChange={e=>change({...settings,songSync:e.target.checked,trackId:e.target.checked?trackId:''})}/> An aktuellen Titel binden</label>
  </div>
  <small>{grid.source==='imported'?`Song-Raster: Beats ${grid.beatSource==='imported'?'importiert':'BPM-Fallback'}, Takte ${grid.barSource==='imported'?'importiert':'abgeleitet'}.`:'BPM-Raster: keine passende importierte Analyse.'} {settings.songSync&&settings.trackId!==trackId?'Achtung: Die Choreografie gehört zu einem anderen Titel.':'Ohne Titelbindung läuft sie ab dem Start der Bühnenwiedergabe.'}</small>
  <div className="ensemble-studio-v325-timeline" aria-label="Ensemble-Timeline">
   {markers.filter(x=>x<=horizon).slice(0,300).map((m,i)=><span key={`mark-${i}`} style={{left:`${m/horizon*100}%`}} className="ensemble-studio-v325-tick"/>)}
   {grid.sections.filter(x=>x.at<=horizon).map((m,i)=><span key={`section-${i}`} title={m.label??'Abschnittsgrenze'} style={{left:`${m.at/horizon*100}%`}} className="ensemble-studio-v325-section"/>)}
   {settings.keyframes.map(k=><button type="button" key={k.id} className={`ensemble-studio-v325-cue ${selected===k.id?'is-selected':''}`} style={{left:`${Math.min(99,Math.max(0,k.at/horizon*100))}%`}}
    onPointerDown={e=>timelineDown(e,k)} onPointerMove={timelineMove} onPointerUp={timelineEnd} onPointerCancel={e=>timelineEnd(e,true)} onClick={()=>{setSelected(k.id);setPlaying(false);setSeconds(k.at);}}
    onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();edit(k.id,{at:quant(k.at+(e.key==='ArrowRight'?1:-1)*(settings.snap==='bar'?60/settings.bpm*4:60/settings.bpm))});}}}
    title={`${k.at}s · ${roleLabels[k.role]} · ${formLabels[k.formation]}`} aria-label={`Cue ${k.id} ${k.at} Sekunden`}>{k.role==='lead-solo'?'L':k.role==='partner-solo'?'P':'●'}</button>)}
   <span className="ensemble-studio-v325-playhead" style={{left:`${Math.min(100,seconds/horizon*100)}%`}}/>
  </div>
  <label>Vorschau: {seconds.toFixed(1)} s <input type="range" min="0" max={horizon} step=".1" value={Math.min(seconds,horizon)} onChange={e=>{setPlaying(false);setSeconds(Number(e.target.value));}}/></label>
  <div className="ensemble-studio-v325-controls"><button type="button" onClick={()=>{setPlaying(p=>!p);setFollowSong(false);}}>{playing?'Vorschau pausieren':'Vorschau starten'}</button><button type="button" onClick={()=>{setPlaying(false);setSeconds(0);}}>Zurücksetzen</button>
   <label className="setting-check"><input type="checkbox" checked={followSong} disabled={!trackId} onChange={e=>{setFollowSong(e.target.checked);setPlaying(false);}}/> Spotify-Spielposition folgen {isPlaying?'(läuft)':'(pausiert)'}</label>
   <label className="setting-check"><input type="checkbox" checked={show3d} onChange={e=>setShow3d(e.target.checked)}/> 3D-Vorschau anzeigen</label></div>
  {show3d&&<Preview pose={pose} seconds={seconds} leadUrl={leadModel.url} partnerUrl={partnerModel.url}/>}
  {active&&<div className="ensemble-studio-v325-editor"><h4>Formation bei {active.at.toFixed(2)} s</h4>
   <div className="ensemble-studio-v325-controls">
    <label>Start (s) <input type="number" min="0" max="3600" step=".1" value={active.at} onChange={e=>edit(active.id,{at:quant(Number(e.target.value))})}/></label>
    <label>Formation <select value={active.formation} onChange={e=>{const f=e.target.value as EnsembleKeyframeV325['formation'];const p=coords[f];edit(active.id,{formation:f,leadX:p[0],partnerX:p[1],leadZ:p[2],partnerZ:p[3]});}}>{Object.entries(formLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <label>Rolle <select value={active.role} onChange={e=>edit(active.id,{role:e.target.value as EnsembleKeyframeV325['role']})}>{Object.entries(roleLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
    <label>Überblendung (s) <input type="number" min="0" max="8" step=".1" value={active.transition} onChange={e=>edit(active.id,{transition:Number(e.target.value)})}/></label>
    <label className="setting-check"><input type="checkbox" checked={active.drop} onChange={e=>edit(active.id,{drop:e.target.checked})}/> Gemeinsamer Drop</label>
   </div>
   <p>Positionen aus der Draufsicht verändern – blauer Tänzer links, violetter Tänzer rechts. Die Sicherheitsabstände gelten auch bei manuellen Positionen.</p>
   <div className="ensemble-studio-v325-stage" aria-label="Bühnen-Draufsicht">
    {(['lead','partner'] as const).map(which=><button type="button" key={which} className={`ensemble-studio-v325-dancer ${which}`} style={{left:`${50+(which==='lead'?active.leadX:active.partnerX)*12.5}%`,top:`${50+(which==='lead'?active.leadZ:active.partnerZ)*25}%`}}
     onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);stageDrag.current={pointer:e.pointerId,id:active.id,which};}}
     onPointerMove={e=>{if(stageDrag.current?.pointer===e.pointerId)stageSet(e,which,active);}}
     onPointerUp={e=>{if(stageDrag.current?.pointer!==e.pointerId)return;stageSet(e,which,active);stageDrag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
     onPointerCancel={()=>{stageDrag.current=null;}} aria-label={which==='lead'?'Lead verschieben':'Partner verschieben'}>{which==='lead'?'L':'P'}</button>)}
   </div>
   <div className="ensemble-studio-v325-controls"><button type="button" onClick={append}>+ Cue an Abspielposition</button><button type="button" disabled={settings.keyframes.length<=1} onClick={()=>{change({...settings,keyframes:settings.keyframes.filter(k=>k.id!==active.id)});setSelected(settings.keyframes.find(k=>k.id!==active.id)?.id??'');}}>Cue entfernen</button>
    <button type="button" disabled={!lastEdit} onClick={()=>{if(lastEdit){const restored=writeEnsembleTimelineV325(lastEdit);setSettings(restored);setLastEdit(null);}}}>Letzte Änderung rückgängig</button>
    <button type="button" onClick={()=>{change(ENSEMBLE_TIMELINE_DEFAULT_V325);setSelected('intro');}}>Beispiel zurücksetzen</button></div>
  </div>}
  <div className="ensemble-studio-v325-controls"><button type="button" onClick={()=>{const blob=new Blob([JSON.stringify(settings,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='sonic-ensemble-v325.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),300);}}>Choreografie exportieren</button>
   <label>Choreografie importieren <input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>200000)throw Error('Datei zu groß');const raw=JSON.parse(await file.text());const next=normalizeEnsembleTimelineV325(raw);if(!Array.isArray(raw?.keyframes))throw Error('Ungültiger Cue-Aufbau');change({...next,enabled:false});setSelected(next.keyframes[0]?.id??'');}catch{setError('Die JSON-Choreografie ist ungültig.');}e.target.value='';}}/></label></div>
  {error&&<small role="alert">{error}</small>}
  <small>Nur zwei Tänzer. Die Live-Bühne verwendet dieselben Cue-Zeiten und Gruppenpositionen; die Vorschau zeigt die Formationen in 3D, aber keine komplette Licht-/Kamera-/IK-Show. Importierte Beats hängen von der Analyse des aktuellen Titels ab. Die Choreografie ist erst nach Aktivierung live.</small>
 </fieldset>;
}
