'use client';
import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import dynamic from 'next/dynamic';
import {useMusic} from '@/context/MusicContext';
import {GroupDanceSyncControlsV327} from './GroupDanceSyncControlsV327';
import {LowPoseControlsV481} from './LowPoseControlsV481';
import {GroupMotionSyncControlsV328} from './GroupMotionSyncControlsV328';
import {GroupMotionPhraseControlsV329} from './GroupMotionPhraseControlsV329';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import {avatarModels,getAvatarModel} from './avatarModels';
import {ANALYSIS_EVENT_V318,readTrackAnalysisV318,type TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {makeMotionGridV319} from './musicMotionTimelineV319';
import {gridMarkersV325,snapEnsembleSecondV325} from './ensembleChoreographyV325';
import {GROUP_DEFAULT_V326,readGroupV326,writeGroupV326,layoutV326,normalizeGroupV326,evaluateGroupV326,updateGroupCueV326,
 type GroupCueV326,type GroupStudioV326,type GroupPointV326,type GroupFormationV326} from './multiAvatarStageDirectorV326';
const Preview=dynamic(()=>import('./MultiAvatarPreviewV326').then(m=>m.MultiAvatarPreviewV326),{ssr:false});
const labels=['Lead','Partner','Tänzer 3','Tänzer 4'];
const formations:GroupFormationV326[]=['line','wide','arc','stagger'];
const forms:{[K in GroupFormationV326]:string}={line:'Linie',wide:'Breite Linie',arc:'Bogen',stagger:'Versetzt'};
const dotColors=['#64def0','#bd8aff','#68e9ab','#ffcc7d'];
export function MultiAvatarStageStudioV326(){
 const {track,progressMs,isPlaying}=useMusic();const {preferences}=useUiPreferences();const trackId=track?.id??'';
 const [settings,setSettings]=useState<GroupStudioV326>(GROUP_DEFAULT_V326);
 const [analysis,setAnalysis]=useState<TrackAnalysisV318|null>(null);
 const [seconds,setSeconds]=useState(0),[playing,setPlaying]=useState(false),[follow,setFollow]=useState(false),[show3d,setShow3d]=useState(false);
 const [selected,setSelected]=useState('intro'),[error,setError]=useState('');
 const [undo,setUndo]=useState<GroupStudioV326|null>(null);
 const drag=useRef<{pointer:number;id:string;origin:number;start:number;width:number}|null>(null);
 const stageDrag=useRef<{pointer:number;id:string;slot:number}|null>(null);
 useEffect(()=>{const s=readGroupV326();setSettings(s);setSelected(s.cues[0]?.id??'');},[]);
 useEffect(()=>{const cb=()=>setAnalysis(readTrackAnalysisV318(trackId));cb();window.addEventListener(ANALYSIS_EVENT_V318,cb);return()=>window.removeEventListener(ANALYSIS_EVENT_V318,cb);},[trackId]);
 useEffect(()=>{if(follow&&trackId)setSeconds(Math.max(0,progressMs/1000));},[follow,progressMs,trackId]);
 useEffect(()=>{if(!playing||follow)return;let prior=0,id=0;const tick=(now:number)=>{if(prior)setSeconds(s=>Math.min(3600,s+Math.min(.1,(now-prior)/1000)));prior=now;id=requestAnimationFrame(tick);};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id);},[playing,follow]);
 const horizon=Math.max(24,Math.min(240,Math.ceil((settings.cues.at(-1)?.at??0)/8)*8+16));
 const grid=useMemo(()=>makeMotionGridV319(trackId,analysis,settings.bpm,horizon),[trackId,analysis,settings.bpm,horizon]);
 const markers=useMemo(()=>gridMarkersV325(grid.tempo,grid.timeSignature,horizon,grid.beats,grid.bars,settings.snap),[grid,horizon,settings.snap]);
 const imported=settings.snap==='beat'?grid.beatSource==='imported':settings.snap==='bar'&&grid.barSource==='imported';
 const quant=(t:number)=>snapEnsembleSecondV325(t,markers,settings.snap,imported);
 const active=settings.cues.find(c=>c.id===selected)??settings.cues[0];
 const pose=evaluateGroupV326(settings,seconds);
 const put=(next:GroupStudioV326)=>{setUndo(settings);setSettings(writeGroupV326(next));setError('');};
 const edit=(id:string,patch:Partial<GroupCueV326>)=>put(updateGroupCueV326(settings,id,patch));
 const newCue=()=>{const last=settings.cues.at(-1)??GROUP_DEFAULT_V326.cues[0];const at=quant(seconds);const id=`cue-${Date.now().toString(36)}`;
  put({...settings,cues:[...settings.cues,{...last,id,at,positions:last.positions.map(p=>[...p] as GroupPointV326)}]});setSelected(id);};
 const moveStage=(e:PointerEvent<HTMLButtonElement>,slot:number,cue:GroupCueV326)=>{
  const rect=e.currentTarget.parentElement?.getBoundingClientRect();if(!rect)return;
  const x=(e.clientX-rect.left)/rect.width*9-4.5;
  const z=(e.clientY-rect.top)/rect.height*4-2;
  const positions=cue.positions.map((p,i)=>(i===slot?[x,0,z]:p) as GroupPointV326);
  edit(cue.id,{positions});
 };
 const primary=preferences.avatarModelId,secondary=preferences.secondaryAvatarModelId??primary;
 const ids=[primary,secondary,settings.modelIds[2]||primary,settings.modelIds[3]||secondary];
 const urls=ids.map(id=>getAvatarModel(id).url);
 const selectable=[...new Map([...avatarModels,{...getAvatarModel(primary),id:primary},{...getAvatarModel(secondary),id:secondary}].map(m=>[m.id,m])).values()];
 return <fieldset className="multi-avatar-studio-v326"><legend>Advanced Multi-Avatar Stage Director · V326</legend>
  <p>Eigener Gruppenmodus für <strong>drei oder vier echte 3D-Tänzer</strong>. Jeder besitzt eine getrennte Animation und Foot-IK. Aktivierung ersetzt die V325-Zwei-Tänzer-Formation nur für die laufende Bühne.</p>
  <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>put({...settings,enabled:e.target.checked})}/> Gruppenmodus live aktivieren (V325 bleibt gespeichert)</label>
  <div className="ensemble-studio-v325-controls">
   <label>Tänzer <select value={settings.count} onChange={e=>{const count=e.target.value==='3'?3:4;put({...settings,count,cues:settings.cues.map(c=>({...c,positions:layoutV326(c.formation,count)}))});}}><option value="3">3 Tänzer</option><option value="4">4 Tänzer</option></select></label>
   <label>Mindestabstand ({settings.minSpacing.toFixed(2)}) <input type="range" min="0.7" max="2.3" step=".05" value={settings.minSpacing} onChange={e=>put({...settings,minSpacing:Number(e.target.value)})}/></label>
   <label>Raster <select value={settings.snap} onChange={e=>put({...settings,snap:e.target.value as GroupStudioV326['snap']})}><option value="bar">Takte</option><option value="beat">Beats</option><option value="off">Frei</option></select></label>
   <label>BPM-Fallback <input type="number" min="40" max="240" value={settings.bpm} onChange={e=>put({...settings,bpm:Number(e.target.value)})}/></label>
   <label className="setting-check"><input type="checkbox" checked={settings.songSync} disabled={!trackId} onChange={e=>put({...settings,songSync:e.target.checked,trackId:e.target.checked?trackId:''})}/> An aktuellen Song binden</label>
  </div>
  <small>{grid.source==='imported'?'Musikmarkierungen V318 (teilweise BPM-Fallback)':'BPM-Raster ohne passende importierte Analyse'}. {settings.songSync&&settings.trackId!==trackId?'Aktueller Song stimmt nicht mit der gespeicherten Bindung überein.':''}</small>
  <div className="ensemble-studio-v325-timeline" aria-label="V326 Gruppen-Timeline">
   {markers.filter(x=>x<=horizon).slice(0,300).map((t,i)=><span key={i} className="ensemble-studio-v325-tick" style={{left:`${100*t/horizon}%`}}/>)}
   {settings.cues.map(c=><button type="button" key={c.id} className={`ensemble-studio-v325-cue ${selected===c.id?'is-selected':''}`} style={{left:`${Math.min(99,Math.max(0,100*c.at/horizon))}%`}}
    onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag.current={pointer:e.pointerId,id:c.id,origin:e.clientX,start:c.at,width:e.currentTarget.parentElement?.getBoundingClientRect().width||500};setSelected(c.id);}}
    onPointerUp={e=>{const d=drag.current;if(d?.pointer!==e.pointerId)return;drag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);edit(d.id,{at:quant(d.start+(e.clientX-d.origin)/d.width*horizon)});}}
    onPointerCancel={()=>{drag.current=null;}}
    onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();edit(c.id,{at:quant(c.at+(e.key==='ArrowRight'?1:-1)*60/settings.bpm*(settings.snap==='bar'?4:1))});}}}
    onClick={()=>{setSelected(c.id);setPlaying(false);setSeconds(c.at);}} aria-label={`Cue ${c.id} bei ${c.at} Sekunden`} title={`${c.formation}, ${c.at.toFixed(1)} Sekunden`}>{c.focus>=0?c.focus+1:'●'}</button>)}
   <span className="ensemble-studio-v325-playhead" style={{left:`${Math.min(100,seconds/horizon*100)}%`}}/>
  </div>
  <label>Vorschau {seconds.toFixed(1)} s <input type="range" min="0" max={horizon} step=".1" value={Math.min(seconds,horizon)} onChange={e=>{setSeconds(Number(e.target.value));setPlaying(false);}}/></label>
  <div className="ensemble-studio-v325-controls"><button type="button" onClick={()=>{setPlaying(x=>!x);setFollow(false);}}>{playing?'Pausieren':'Vorschau starten'}</button><button type="button" onClick={()=>{setSeconds(0);setPlaying(false);}}>Zurücksetzen</button>
   <label className="setting-check"><input type="checkbox" checked={follow} disabled={!trackId} onChange={e=>{setFollow(e.target.checked);setPlaying(false);}}/> Songposition folgen {isPlaying?'(läuft)':'(pausiert)'}</label>
   <label className="setting-check"><input type="checkbox" checked={show3d} onChange={e=>setShow3d(e.target.checked)}/> 3D-Vorschau anzeigen</label>
  </div>
  {show3d&&<Preview pose={pose} seconds={seconds} urls={urls} bpm={analysis?.tempo??settings.bpm} analysis={analysis?.trackId===trackId?analysis:null} playing={playing||follow&&isPlaying} songSync={settings.songSync&&settings.trackId===trackId}/>}
  <LowPoseControlsV481/>
  <GroupDanceSyncControlsV327 seconds={seconds} count={settings.count} bpm={settings.bpm} pose={pose} analysis={analysis} playing={playing||follow&&isPlaying} trackMatches={!analysis||analysis.trackId===trackId}/>
  <GroupMotionSyncControlsV328 seconds={seconds} count={settings.count} bpm={settings.bpm} analysis={analysis} playing={playing||follow&&isPlaying} songSync={settings.songSync} />
  <GroupMotionPhraseControlsV329 />
  <div className="ensemble-studio-v325-controls">{Array.from({length:settings.count},(_,i)=><label key={i}>{labels[i]}-Modell
    <select value={i<2?'':settings.modelIds[i]} disabled={i<2} onChange={e=>put({...settings,modelIds:settings.modelIds.map((v,j)=>i===j?e.target.value:v)})}>
     {i<2?<option value="">Einstellung des aktuellen Avatars</option>:<><option value="">Aktuelles {i===2?'Lead-':'Partner-'}Modell übernehmen</option>{selectable.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</>}
    </select></label>)}</div>
  {active&&<div className="ensemble-studio-v325-editor"><h4>Cue {active.at.toFixed(2)} s · {active.id}</h4><div className="ensemble-studio-v325-controls">
   <label>Zeit (s) <input type="number" min="0" max="3600" step=".1" value={active.at} onChange={e=>edit(active.id,{at:quant(Number(e.target.value))})}/></label>
   <label>Formation <select value={active.formation} onChange={e=>{const formation=e.target.value as GroupFormationV326;edit(active.id,{formation,positions:layoutV326(formation,settings.count)});}}>{formations.map(f=><option key={f} value={f}>{forms[f]}</option>)}</select></label>
   <label>Solo <select value={active.focus} onChange={e=>edit(active.id,{focus:Number(e.target.value)})}><option value="-1">Alle zusammen</option>{Array.from({length:settings.count},(_,i)=><option key={i} value={i}>{labels[i]}</option>)}</select></label>
   <label>Übergang (s) <input type="number" min="0" max="8" step=".1" value={active.transition} onChange={e=>edit(active.id,{transition:Number(e.target.value)})}/></label>
   <label className="setting-check"><input type="checkbox" checked={active.drop} onChange={e=>edit(active.id,{drop:e.target.checked})}/> Gemeinsamer Drop</label>
  </div><p>Positionen in der Draufsicht ziehen. Die Reihenfolge bleibt beim Live-Abspielen stabil und der Abstandsregler korrigiert zu enge Gruppenplätze.</p>
  <div className="ensemble-studio-v325-stage" aria-label="Bühnen-Draufsicht für bis zu vier Tänzer">
   {active.positions.slice(0,settings.count).map((p,i)=><button key={i} type="button" className="ensemble-studio-v325-dancer" style={{left:`${50+100*p[0]/9}%`,top:`${50+100*p[2]/4}%`,background:dotColors[i]}}
    onPointerDown={e=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);stageDrag.current={pointer:e.pointerId,id:active.id,slot:i};}}
    onPointerMove={e=>{if(stageDrag.current?.pointer===e.pointerId)moveStage(e,i,active);}}
    onPointerUp={e=>{if(stageDrag.current?.pointer!==e.pointerId)return;moveStage(e,i,active);stageDrag.current=null;if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);}}
    onPointerCancel={()=>{stageDrag.current=null;}} aria-label={`${labels[i]} verschieben`}>{i+1}</button>)}
  </div><small>{pose?.spacingAdjusted?'Abstandsschutz verschiebt zu enge Bühnenplätze.':'Bühnenabstand sicher.'}</small>
  <div className="ensemble-studio-v325-controls"><button type="button" onClick={newCue}>+ Cue erstellen</button><button type="button" disabled={settings.cues.length<=1} onClick={()=>{put({...settings,cues:settings.cues.filter(c=>c.id!==active.id)});setSelected(settings.cues.find(c=>c.id!==active.id)?.id??'');}}>Cue entfernen</button>
   <button type="button" disabled={!undo} onClick={()=>{if(undo){setSettings(writeGroupV326(undo));setUndo(null);}}}>Rückgängig</button>
   <button type="button" onClick={()=>{const next=normalizeGroupV326(GROUP_DEFAULT_V326);put(next);setSelected('intro');}}>Demo zurücksetzen</button></div></div>}
  <div className="ensemble-studio-v325-controls"><button type="button" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(settings,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='sonic-group-v326.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);}}>Gruppen-Choreografie exportieren</button>
   <label>JSON importieren <input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>200000)throw Error('Datei zu groß');const data=JSON.parse(await file.text());if(!Array.isArray(data?.cues))throw Error('Ungültige Cues');const next=normalizeGroupV326({...data,enabled:false});put(next);setSelected(next.cues[0]?.id??'');}catch{setError('Ungültige Gruppen-Choreografie.');}e.target.value='';}}/></label></div>
  {error&&<small role="alert">{error}</small>}
  <small>V326 unterstützt bewusst maximal vier gleichzeitige Tänzer. Einzelne GLB-Skelette bekommen eigene Mixer, aber keine automatisch erfundene neue Motion; Performance hängt von Gerät, Mesh und Clipgröße ab. Gruppenabstände sind keine Kollisionserkennung und Bewegungen der Gruppen-Roots können sichtbare Fußverschiebungen bewirken. V326 bleibt bis zur Aktivierung ausgeschaltet.</small>
 </fieldset>;
}
