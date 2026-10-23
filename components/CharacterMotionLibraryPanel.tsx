"use client";
import {RhythmIntelligenceDashboard} from "./visualizer/RhythmIntelligenceDashboard";
import {MotionQualityOptimizerDashboard} from "./visualizer/MotionQualityOptimizerDashboard";
import {ExpressiveDanceStudio} from "./visualizer/ExpressiveDanceStudio";
import {MotionStylePanel} from "./visualizer/MotionStylePanel";
import {VisualChoreographyTimelineEditor} from "@/components/visualizer/VisualChoreographyTimelineEditor";
import { SmartChoreographyEvolutionPanel } from "@/components/visualizer/SmartChoreographyEvolutionPanel";
import { ChoreographyLearningDashboard } from "@/components/visualizer/ChoreographyLearningDashboard";
import {useEffect,useState} from "react";
import { AdaptiveChoreographyTimeline } from "@/components/visualizer/AdaptiveChoreographyTimeline";
import { MusicStructureTimelineDirector } from "@/components/visualizer/MusicStructureTimelineDirector";
import { MotionTransitionStudio } from "@/components/visualizer/MotionTransitionStudio";
import { AvatarPreview3D } from "@/components/visualizer/AvatarPreview3D";
import type {AvatarModel} from "@/components/visualizer/avatarModels";
import type {UiPreferences} from "@/types/music";
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,saveCharacterMotionStore,type CharacterMotionStore} from "@/components/visualizer/characterMotionLibrary";
const genres=["","deutschrap","hardtekk","hardstyle","techno","hip-hop","rock","ambient","pop","other"];
export function CharacterMotionLibraryPanel({models,preferences,admin}:{models:AvatarModel[];preferences:UiPreferences;admin:boolean}){
 const [store,setStore]=useState<CharacterMotionStore>({version:1,motions:[],automatic:false});
 const [avatar,setAvatar]=useState("");const [preview,setPreview]=useState("");const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{const update=()=>setStore(loadCharacterMotionStore());update();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);return()=>window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);},[]);
 const model=models.find(m=>m.id===avatar);const motions=store.motions.filter(m=>m.avatarId===avatar);
 function change(fn:(s:CharacterMotionStore)=>CharacterMotionStore){setStore(old=>saveCharacterMotionStore(fn(old)));}
 async function activate(url:string){if(!admin||!model)return;setBusy(true);setMessage("");try{const r=await fetch("/api/avatars/animations/install",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({modelId:avatar.startsWith("local:")?avatar:`default:${avatar}`,animationUrl:url})});if(!r.ok){const d=await r.json();throw Error(d.error||"Aktivieren fehlgeschlagen");}setMessage("Motion aktiviert. Aktualisiere die Bühne, falls sie noch die vorige Motion anzeigt.");}catch(e){setMessage(e instanceof Error?e.message:"Fehler");}finally{setBusy(false);}}
 return <section className="avatar-metadata-editor" aria-label="Multi-Motion Character Library">
 <h3>Multi-Motion Character Library · V190</h3><p>Mehrere installierte Clips pro Charakter, Genre-/BPM-Regeln und eine Vorschau. Eine aktivierte Motion bleibt auf dem Server registriert.</p>
 <label>Charakter<select value={avatar} onChange={e=>{setAvatar(e.target.value);setPreview("");}}><option value="">Charakter auswählen</option>{models.filter(m=>m.url).map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
 <label className="setting-check"><input type="checkbox" checked={store.automatic} onChange={e=>change(s=>({...s,automatic:e.target.checked}))}/> Automatische Motion-Auswahl anhand Genre und Songabschnitt (experimentell)</label>
 {model&&<><p>{motions.length} installierte Motions für {model.label}</p>{motions.map(m=><div key={m.id} className="avatar-metadata-editor"><strong>{m.name}</strong><label>Genre<select value={m.genre} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,genre:e.target.value}:x)}))}>{genres.map(g=><option value={g} key={g}>{g||"Jedes Genre"}</option>)}</select></label>
 <label>Songabschnitt<select value={m.section} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,section:e.target.value as typeof x.section}:x)}))}>{["any","build","drop","verse","hook"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
 <label>BPM min<input type="number" min="0" max="300" value={m.bpmMin} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,bpmMin:Number(e.target.value)}:x)}))}/></label><label>BPM max<input type="number" min="0" max="300" value={m.bpmMax} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,bpmMax:Number(e.target.value)}:x)}))}/></label>
 <button type="button" onClick={()=>setPreview(m.url)}>Vorschau</button> <button type="button" disabled={!admin||busy} onClick={()=>void activate(m.url)}>Als aktive Motion festlegen</button> <button type="button" onClick={()=>{change(s=>({...s,motions:s.motions.filter(x=>x.id!==m.id)}));if(preview===m.url)setPreview("");}}>Aus Bibliothek entfernen</button></div>)}
 {motions.length>=2&&<MotionTransitionStudio model={model} motions={motions}/>}
 <MotionQualityOptimizerDashboard avatarId={avatar} motions={motions} modelUrl={model.url ?? undefined}/>
 <MotionStylePanel avatarId={avatar}/>
 <ExpressiveDanceStudio avatarId={avatar}/>
 <MusicStructureTimelineDirector avatarId={avatar}/>
 <RhythmIntelligenceDashboard/>
 <AdaptiveChoreographyTimeline avatarId={avatar} motions={motions}/>
 <ChoreographyLearningDashboard avatarId={avatar} motions={motions}/>
 <SmartChoreographyEvolutionPanel avatarId={avatar} motions={motions}/>
 <VisualChoreographyTimelineEditor avatarId={avatar} model={model} motions={motions} preferences={preferences}/>
 {preview&&<div style={{minHeight:260}}><AvatarPreview3D modelUrl={model.url} animationUrl={preview} studio preferences={preferences}/></div>}</>}
 {message&&<p role="status">{message}</p>}
 <small>Die Bibliothek wird lokal im Browser gespeichert. „Aus Bibliothek entfernen“ löscht keine GLB-Dateien vom Server. Automatik wählt eine Datei pro Songabschnitt; Crossfades werden seit V191 unterstützt.</small>
 </section>;
}
