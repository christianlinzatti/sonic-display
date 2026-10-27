"use client";
import {RhythmIntelligenceDashboard} from "./visualizer/RhythmIntelligenceDashboard";
import {MotionQualityOptimizerDashboard} from "./visualizer/MotionQualityOptimizerDashboard";
import {ExpressiveDanceStudio} from "./visualizer/ExpressiveDanceStudio";
import {MotionStylePanel} from "./visualizer/MotionStylePanel";
import {VisualChoreographyTimelineEditor} from "@/components/visualizer/VisualChoreographyTimelineEditor";
import { SmartChoreographyEvolutionPanel } from "@/components/visualizer/SmartChoreographyEvolutionPanel";
import { ChoreographyLearningDashboard } from "@/components/visualizer/ChoreographyLearningDashboard";
import {useEffect,useState} from "react";
import {readGLB,fingerprintInstalledMotionV535} from "@/components/visualizer/motionClipInspector";
import {MOTION_CATEGORIES_V535,MOTION_CATEGORY_LABELS_V535,filterMotionsV535,countKnownDuplicatesV535,duplicateInAvatarV535,suggestMotionCategoryV535,validMotionCategoryV535,type MotionCategoryV535} from "@/components/visualizer/motionLibraryIntelligenceV535";
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
 const [searchV535,setSearchV535]=useState("");const [categoryV535,setCategoryV535]=useState<MotionCategoryV535|"all">("all");
 const [favoritesOnlyV535,setFavoritesOnlyV535]=useState(false);
 const [scanBusyV535,setScanBusyV535]=useState(false);const [scanCursorV535,setScanCursorV535]=useState(0);
 const [embeddedClipsV535,setEmbeddedClipsV535]=useState<{index:number;name:string;duration:number}[]>([]);
 const [embeddedBusyV535,setEmbeddedBusyV535]=useState(false);
 const [embeddedPreviewIndexV535,setEmbeddedPreviewIndexV535]=useState<number|undefined>();
 const [embeddedPrefsV535,setEmbeddedPrefsV535]=useState<Record<string,{favorite:boolean;category:MotionCategoryV535}>>({});
 useEffect(()=>{try{
  const raw=JSON.parse(localStorage.getItem("sonic.embedded.motion.prefs.v535")||"{}");
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return;
  const safe:Record<string,{favorite:boolean;category:MotionCategoryV535}>={};
  for(const [key,v] of Object.entries(raw).slice(-500)){
   if(key.length>1024||!v||typeof v!=="object"||Array.isArray(v))continue;
   const item=v as Record<string,unknown>;
   if(validMotionCategoryV535(item.category))safe[key]={favorite:item.favorite===true,category:item.category};
  }
  setEmbeddedPrefsV535(safe);
 }catch{/* Old settings stay valid and no data is erased. */}},[]);
 useEffect(()=>{const update=()=>setStore(loadCharacterMotionStore());update();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);return()=>window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,update);},[]);
 const model=models.find(m=>m.id===avatar);const motions=store.motions.filter(m=>m.avatarId===avatar);
 const visibleMotionsV535=filterMotionsV535(motions,{avatarId:avatar,search:searchV535,category:categoryV535,favoritesOnly:favoritesOnlyV535});
 const duplicatesV535=countKnownDuplicatesV535(motions,avatar);
 async function fingerprintExistingV535(){
  if(scanBusyV535||!avatar)return;
  setScanBusyV535(true);setMessage("");let updated=0;let skipped=0;
  try{
   // Explicit operation only. Avoid downloading many large files on a Pi.
   const pending=motions.slice(scanCursorV535,scanCursorV535+24).filter(m=>!m.fingerprint);
   const fingerprints=new Map<string,string>();
   for(const motion of pending){
    try{const fp=await fingerprintInstalledMotionV535(motion.url);if(fp){fingerprints.set(motion.id,fp);updated++;}else skipped++;}
    catch{skipped++;} // Offline, legacy multi-clip file, or unparseable data: never assign a guessed fingerprint.
   }
   if(updated){
    const latest=loadCharacterMotionStore();
    saveCharacterMotionStore({...latest,motions:latest.motions.map(m=>fingerprints.has(m.id)&&m.url===motions.find(x=>x.id===m.id)?.url?{...m,fingerprint:fingerprints.get(m.id)}:m)});
   }
   setScanCursorV535(scanCursorV535+24>=motions.length?0:scanCursorV535+24);
   setMessage(`${updated} Fingerabdrücke ergänzt, ${skipped} nicht auswertbar. Maximal 24 Dateien pro Prüfung; identische Namen wurden nicht automatisch zusammengelegt.`);
  }finally{setScanBusyV535(false);}
 }
 async function loadEmbeddedInventoryV535(){
  if(!model?.url||embeddedBusyV535)return;
  setEmbeddedBusyV535(true);setMessage("");
  try{
   const gltf=await readGLB(model.sharedMotionUrl||model.url);
   setEmbeddedClipsV535(gltf.animations.slice(0,64).map((clip,index)=>({index,name:clip.name||`Clip ${index+1}`,duration:clip.duration})));
   if(gltf.animations.length>64)setMessage("Erste 64 eingebettete Clips angezeigt. Das GLB selbst bleibt vollständig erhalten.");
  }catch(error){setMessage(error instanceof Error?error.message:"Eingebettete Motions konnten nicht gelesen werden");}
  finally{setEmbeddedBusyV535(false);}
 }
 function embeddedKeyV535(index:number){return `${avatar}:${model?.url??""}:${index}`;}
 function setEmbeddedPreferenceV535(index:number,patch:Partial<{favorite:boolean;category:MotionCategoryV535}>){
  const key=embeddedKeyV535(index);
  const clip=embeddedClipsV535.find(x=>x.index===index);
  const old=embeddedPrefsV535[key]??{favorite:false,category:suggestMotionCategoryV535(clip?.name??"")};
  const next={...embeddedPrefsV535,[key]:{...old,...patch}};
  setEmbeddedPrefsV535(next);
  try{localStorage.setItem("sonic.embedded.motion.prefs.v535",JSON.stringify(Object.fromEntries(Object.entries(next).slice(-500))));}
  catch{/* Browsers with disabled storage keep session preferences only. */}
 }
 function change(fn:(s:CharacterMotionStore)=>CharacterMotionStore){setStore(old=>saveCharacterMotionStore(fn(old)));}
 async function activate(url:string){if(!admin||!model)return;setBusy(true);setMessage("");try{const r=await fetch("/api/avatars/animations/install",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({modelId:avatar.startsWith("local:")?avatar:`default:${avatar}`,animationUrl:url})});if(!r.ok){const d=await r.json();throw Error(d.error||"Aktivieren fehlgeschlagen");}setMessage("Motion aktiviert. Aktualisiere die Bühne, falls sie noch die vorige Motion anzeigt.");}catch(e){setMessage(e instanceof Error?e.message:"Fehler");}finally{setBusy(false);}}
 return <section className="avatar-metadata-editor" aria-label="Multi-Motion Character Library">
 <h3>Intelligent Motion Library · V535</h3><p>Deine Motion-Sammlung mit Suche, Kategorien, Favoriten und vorsichtiger Dublettenerkennung nach tatsächlichen Animationskurven. Bestehende Choreografien bleiben unverändert.</p>
 <label>Charakter<select value={avatar} onChange={e=>{setAvatar(e.target.value);setPreview("");setSearchV535("");setCategoryV535("all");setEmbeddedClipsV535([]);setEmbeddedPreviewIndexV535(undefined);setScanCursorV535(0);}}><option value="">Charakter auswählen</option>{models.filter(m=>m.url).map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
 <label className="setting-check"><input type="checkbox" checked={store.automatic} onChange={e=>change(s=>({...s,automatic:e.target.checked}))}/> Automatische Motion-Auswahl anhand Genre und Songabschnitt (experimentell)</label>
 {model&&<>
 <div className="avatar-metadata-editor" aria-label="V535 Motion Library Filter">
  <strong>V535 · Motion-Bibliothek durchsuchen</strong>
  <p role="status">{motions.length} Motions für {model.label} · {motions.filter(m=>m.favorite).length} Favoriten · {duplicatesV535} durch Keyframes belegte Dubletten</p>
  <label>Suche<input type="search" value={searchV535} onChange={e=>setSearchV535(e.target.value)} placeholder="Name oder Kategorie suchen" /></label>
  <label>Kategorie<select value={categoryV535} onChange={e=>setCategoryV535(e.target.value as MotionCategoryV535|"all")}><option value="all">Alle Kategorien</option>{MOTION_CATEGORIES_V535.map(c=><option value={c} key={c}>{MOTION_CATEGORY_LABELS_V535[c]}</option>)}</select></label>
  <label className="setting-check"><input type="checkbox" checked={favoritesOnlyV535} onChange={e=>setFavoritesOnlyV535(e.target.checked)}/> Nur Favoriten anzeigen</label>
  <button type="button" disabled={scanBusyV535||busy||!motions.some(m=>!m.fingerprint)} onClick={()=>void fingerprintExistingV535()}>{scanBusyV535?"Prüfe bis zu 24 GLBs…":"Ältere Motions auf Dubletten prüfen (bis zu 24)"}</button>
  <small>Es werden nur echte Animationsdaten verglichen, pro Avatar. Eine identische Bezeichnung genügt nicht. Alte Mehrfachclip-GLBs und nicht ladbare Dateien bleiben unangetastet. Die 3D-Sichtprüfung ersetzt dies nicht.</small>
 </div>
 <div className="avatar-metadata-editor" aria-label="V535 eingebettete Avatar-Clips">
  <strong>Im Avatar eingebettete Animationen</strong>
  <p>Auch Animationen, die direkt in der Avatar-GLB stecken (nicht als separate Motion-Dateien installiert), können nach Namen und Kategorie gefunden und in der originalen 3D-Vorschau getestet werden.</p>
  <button type="button" disabled={embeddedBusyV535} onClick={()=>void loadEmbeddedInventoryV535()}>{embeddedBusyV535?"Lade GLB…":"Eingebettete Animationen aus GLB laden"}</button>
  {embeddedClipsV535.length>0&&<p role="status">{embeddedClipsV535.length} eingebettete Clips geladen. Gemeinsame Motion-Quellen werden berücksichtigt.</p>}
  {embeddedClipsV535.filter(c=>{
   const pref=embeddedPrefsV535[embeddedKeyV535(c.index)];
   const category=pref?.category??suggestMotionCategoryV535(c.name);
   return (!searchV535||c.name.toLowerCase().includes(searchV535.trim().toLowerCase())||category.includes(searchV535.trim().toLowerCase()))&&
    (categoryV535==="all"||category===categoryV535)&&(!favoritesOnlyV535||pref?.favorite===true);
  }).map(c=>{
   const pref=embeddedPrefsV535[embeddedKeyV535(c.index)];
   const category=pref?.category??suggestMotionCategoryV535(c.name);
   return <div key={c.index}>
    <strong>{c.name}</strong> <small>({Number.isFinite(c.duration)?c.duration.toFixed(1):"?"} s)</small>
    <button type="button" onClick={()=>{setPreview("");setEmbeddedPreviewIndexV535(c.index);}}>In 3D ansehen</button>
    <button type="button" aria-pressed={pref?.favorite===true} onClick={()=>setEmbeddedPreferenceV535(c.index,{favorite:!pref?.favorite})}>{pref?.favorite?"★ Favorit":"☆ Favorit"}</button>
    <label>Bewegungsart<select value={category} onChange={e=>setEmbeddedPreferenceV535(c.index,{category:e.target.value as MotionCategoryV535})}>{MOTION_CATEGORIES_V535.map(cat=><option key={cat} value={cat}>{MOTION_CATEGORY_LABELS_V535[cat]}</option>)}</select></label>
   </div>;
  })}
 </div>
 <p>{visibleMotionsV535.length} von {motions.length} separat gespeicherten Motions angezeigt.</p>
 {visibleMotionsV535.map(m=><div key={m.id} className="avatar-metadata-editor"><strong>{m.name}</strong>
 <p><small>{MOTION_CATEGORY_LABELS_V535[m.category??suggestMotionCategoryV535(m.name)]} · {m.fingerprint?"Keyframe-Fingerabdruck vorhanden":"Noch nicht auf identische Bewegungsdaten geprüft"}</small></p>
 {m.fingerprint&&duplicateInAvatarV535(motions.filter(x=>x.id!==m.id),avatar,m.fingerprint)&&<p role="status">Gleiche Bewegungsdaten sind für diesen Avatar bereits in der Bibliothek vorhanden. Vorschau vor dem Entfernen prüfen.</p>}
 <button type="button" aria-pressed={m.favorite===true} onClick={()=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,favorite:!x.favorite}:x)}))}>{m.favorite?"★ Favorit entfernen":"☆ Zu Favoriten hinzufügen"}</button>
 <label>Bewegungsart<select value={m.category??suggestMotionCategoryV535(m.name)} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,category:e.target.value as MotionCategoryV535}:x)}))}>{MOTION_CATEGORIES_V535.map(c=><option value={c} key={c}>{MOTION_CATEGORY_LABELS_V535[c]}</option>)}</select></label><label>Genre<select value={m.genre} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,genre:e.target.value}:x)}))}>{genres.map(g=><option value={g} key={g}>{g||"Jedes Genre"}</option>)}</select></label>
 <label>Songabschnitt<select value={m.section} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,section:e.target.value as typeof x.section}:x)}))}>{["any","build","drop","verse","hook"].map(x=><option key={x} value={x}>{x}</option>)}</select></label>
 <label>BPM min<input type="number" min="0" max="300" value={m.bpmMin} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,bpmMin:Number(e.target.value)}:x)}))}/></label><label>BPM max<input type="number" min="0" max="300" value={m.bpmMax} onChange={e=>change(s=>({...s,motions:s.motions.map(x=>x.id===m.id?{...x,bpmMax:Number(e.target.value)}:x)}))}/></label>
 <button type="button" onClick={()=>{setEmbeddedPreviewIndexV535(undefined);setPreview(m.url);}}>Vorschau</button> <button type="button" disabled={!admin||busy} onClick={()=>void activate(m.url)}>Als aktive Motion festlegen</button> <button type="button" onClick={()=>{change(s=>({...s,motions:s.motions.filter(x=>x.id!==m.id)}));if(preview===m.url)setPreview("");}}>Aus Bibliothek entfernen</button></div>)}
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
 {(preview||embeddedPreviewIndexV535!==undefined)&&<div style={{minHeight:260}}><AvatarPreview3D key={`${model.url}:${preview}:${embeddedPreviewIndexV535??""}`} modelUrl={model.url} animationUrl={preview||undefined} sharedMotionUrlV531={model.sharedMotionUrl} selectedEmbeddedClipIndex={embeddedPreviewIndexV535} studio preferences={preferences}/></div>}</>}
 {message&&<p role="status">{message}</p>}
 <small>V535: Filter, Favoriten und Fingerabdrücke bleiben im bestehenden lokalen Speicher. Die Dublettenerkennung ist optional und entfernt keine Dateien. Die Bibliothek wird lokal im Browser gespeichert. „Aus Bibliothek entfernen“ löscht keine GLB-Dateien vom Server. Automatik wählt eine Datei pro Songabschnitt; Crossfades werden seit V191 unterstützt.</small>
 </section>;
}
