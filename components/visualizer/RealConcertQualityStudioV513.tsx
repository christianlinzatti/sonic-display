'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import dynamic from 'next/dynamic';
import {avatarModels,type AvatarModel} from './avatarModels';
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,type InstalledCharacterMotion} from './characterMotionLibrary';
import type {VisualFrameV512} from './visualConcertQualityV512';
import {previewSampleRateV513,type PreviewTierV513,type PreviewPiV513} from './realConcertQualityV513';
const RealConcertPreviewCanvasV513=dynamic(()=>import('./RealConcertPreviewCanvasV513').then(m=>m.RealConcertPreviewCanvasV513),{
 ssr:false,loading:()=> <p className="settings-note">3D-Vorschau wird geladen …</p>,
});
/** Opening the panel is the sole trigger for the additional GPU Canvas. */
export function RealConcertQualityStudioV513({frame,mode}:{frame?:VisualFrameV512;mode:'live'|'demo'}){
 const [open,setOpen]=useState(false);
 const [options,setOptions]=useState<AvatarModel[]>(avatarModels);
 const [modelIds,setModelIds]=useState<string[]>(['procedural','procedural','procedural','procedural']);
 const [motionIds,setMotionIds]=useState<string[]>(['embedded','embedded','embedded','embedded']);
 const [motions,setMotions]=useState<InstalledCharacterMotion[]>([]);
 const [playing,setPlaying]=useState(false);
 const [cursor,setCursor]=useState(0);
 const [tick,setTick]=useState(0);
 const [tier,setTier]=useState<PreviewTierV513>('balanced');
 const [pi,setPi]=useState<PreviewPiV513>('balanced');
 const [capsules,setCapsules]=useState(true);
 const [qualityEnabled,setQualityEnabled]=useState(true);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();
  fetch('/api/avatars',{cache:'no-store',signal:controller.signal})
   .then(r=>r.ok?r.json():null)
   .then(data=>{if(controller.signal.aborted)return;
    const combined=[...(Array.isArray(data?.defaults)?data.defaults:avatarModels),...(Array.isArray(data?.models)?data.models:[])];
    const seen=new Set<string>();
    setOptions(combined.filter((m:AvatarModel)=>m&&typeof m.id==='string'&&!seen.has(m.id)&&seen.add(m.id)&&(m.url===null||typeof m.url==='string')));
   }).catch(()=>{/* Built-ins remain available offline. */});
  return ()=>controller.abort();
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const reload=()=>setMotions(loadCharacterMotionStore().motions);
  reload();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,reload);window.addEventListener('storage',reload);
  return ()=>{window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,reload);window.removeEventListener('storage',reload);};
 },[open]);
 const count=frame?.positions.length??0;
 const models=useMemo(()=>Array.from({length:count},(_,i)=>options.find(m=>m.id===modelIds[i])??null),[count,options,modelIds]);
 const motionUrls=useMemo(()=>models.map((model,i)=>{
  const chosen=motionIds[i];
  if(chosen==='embedded')return null;
  if(chosen==='model')return model?.animationUrl??null;
  const motion=motions.find(m=>m.id===chosen&&m.avatarId===model?.id);
  return motion?.url??null;
 }),[models,motionIds,motions]);
 const changeModel=(slot:number,id:string)=>{setModelIds(old=>old.map((v,i)=>i===slot?id:v));setMotionIds(old=>old.map((v,i)=>i===slot?'embedded':v));};
 const onTick=useCallback((value:number)=>setTick(value),[]);
 const onSeek=useCallback((seconds:number)=>{setPlaying(false);setCursor(seconds);setTick(seconds);},[]);
 const close=()=>{setOpen(false);setPlaying(false);};
 const togglePlay=()=>{if(playing){setCursor(tick);setPlaying(false);}else setPlaying(true);};
 return <section className="v513-real-quality-studio" aria-label="V513 Real 3D Concert Quality Preview">
  <h4>V513 – Real 3D Concert Quality Preview</h4>
  <p className="settings-note">Prüfe echte, separat geladene GLB-Avatare mit ihren eingebetteten oder installierten Animationen. Die Vorschau ist unabhängig vom laufenden Konzert und startet nur nach dem Öffnen.</p>
  <button type="button" onClick={()=>open?close():setOpen(true)}>{open?'3D-Vorschau schließen':'Echte 3D-Vorschau öffnen'}</button>
  {open&&<>
   <p className="settings-note"><strong>{mode==='live'?'Live-Bühnenpositionen (aufgezeichneter Zeitpunkt)':'Simulierte Bühnenpositionen'}.</strong> Die hier abgespielten GLB-Motions und Kapselrisiken werden eigenständig in dieser Vorschau ermittelt und entsprechen nicht einer synchronen Aufzeichnung der Live-Animation.</p>
   {count>=2&&count<=4?<>
    <div className="v512-controls">{models.map((model,i)=><div key={i}>
     <label>Tänzer {i+1} <select aria-label={`V513 Avatar ${i+1}`} value={modelIds[i]} onChange={e=>changeModel(i,e.target.value)}>
      {options.map(m=><option key={m.id} value={m.id}>{m.label}</option>)}
     </select></label>
     <label>Animation <select aria-label={`V513 Motion ${i+1}`} value={motionIds[i]} onChange={e=>setMotionIds(old=>old.map((x,j)=>i===j?e.target.value:x))}>
      <option value="embedded">Eingebettete GLB-Motion</option>
      {model?.animationUrl&&<option value="model">Modell-Animation</option>}
      {motions.filter(m=>m.avatarId===model?.id).map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
     </select></label>
    </div>)}</div>
    <div className="v512-controls">
     <label>Grafikstufe <select value={tier} onChange={e=>setTier(e.target.value as PreviewTierV513)}><option value="high">High</option><option value="balanced">Balanced</option><option value="low">Low</option></select></label>
     <label>Pi-Sparprofil <select value={pi} onChange={e=>setPi(e.target.value as PreviewPiV513)}><option value="off">Aus</option><option value="balanced">Balanced</option><option value="eco">Eco</option></select></label>
     <label><input type="checkbox" checked={capsules} onChange={e=>setCapsules(e.target.checked)}/> Gemessene Körperkapseln einblenden</label>
     <label><input type="checkbox" checked={qualityEnabled} onChange={e=>setQualityEnabled(e.target.checked)}/> V514 Bewegungsqualität prüfen</label>
    </div>
    <p className="settings-note">Optionale Analyse: maximal {previewSampleRateV513(tier,pi,count)} Hz. Low deaktiviert die Kapselprüfung vollständig; die GLB-Animation bleibt sichtbar.</p>
    <div className="v512-controls"><button type="button" onClick={togglePlay}>{playing?'Pause':'Abspielen'}</button>
     <label>Motion-Zeit (s) <input type="range" min="0" max={Math.max(30,Math.ceil(tick))} step="0.05" disabled={playing} value={playing?tick:cursor} onChange={e=>{setCursor(Number(e.target.value));setTick(Number(e.target.value));}}/> {(playing?tick:cursor).toFixed(1)} s</label>
     <button type="button" onClick={()=>{setPlaying(false);setTick(0);setCursor(0);}}>Neustart</button>
    </div>
    <RealConcertPreviewCanvasV513 frame={frame!} models={models} motions={motionUrls} playing={playing} cursor={cursor} tier={tier} pi={pi} showCapsules={capsules} onTick={onTick} qualityEnabled={qualityEnabled} onSeek={onSeek}/>
   </>:<p className="settings-note">Noch kein geeigneter Bühnenzustand mit 2–4 Avataren. Starte den Demo-Modus oder eine GLB-Show.</p>}
  </>}
 </section>;
}
