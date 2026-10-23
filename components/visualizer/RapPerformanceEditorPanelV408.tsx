"use client";

import {Component,Suspense,useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from "react";
import {Canvas,useFrame} from "@react-three/fiber";
import {OrbitControls} from "@react-three/drei";
import type {Group,Mesh} from "three";
import {useUiPreferences} from "@/context/UiPreferencesContext";
import type {AvatarModel} from "./avatarModels";
import {previewModelsV409,selectedPreviewModelV409} from "./rapAvatarPreviewV409";
import {RapRealAvatarPreviewV409,type RapRigInfoV409,type RapMotionInfoV410} from "./RapRealAvatarPreviewV409";
import {CHARACTER_MOTION_CHANGE_EVENT,loadCharacterMotionStore,type InstalledCharacterMotion} from "./characterMotionLibrary";
import {availableRapPreviewMotionsV410,selectedRapPreviewMotionV410,previewMotionSpeedV410} from "./rapMotionPreviewV410";
import {appendRapTimelineItemV411,moveRapTimelineItemV411,normalizeRapTimelineV411,sampleRapTimelineV411,scheduleRapTimelineV411,RAP_TIMELINE_MAX_V411,type RapTimelineItemV411} from "./rapMotionTimelineV411";
import {loadRapPresetLibraryV412,saveRapPresetLibraryV412,upsertRapPresetV412,removeRapPresetV412,normalizeRapPresetV412,checkRapPresetMotionsV412,RAP_PRESETS_CHANGE_V412,type RapPresetV412,type RapPresetLibraryV412} from "./rapChoreographyPresetsV412";
import {RapLyricsGestureTimelineV414} from "./RapLyricsGestureTimelineV414";
import {RapPerformanceQualityInspectorV418} from "./RapPerformanceQualityInspectorV418";
import {RapPerformanceInspectorPanelV426} from "./RapPerformanceInspectorPanelV426";
import {RapSyllableTimelineEditorV420} from "./RapSyllableTimelineEditorV420";
import {RapAudioAwarePanelV423} from "./RapAudioAwarePanelV423";
import type {RapGestureSampleV414} from "./rapGestureCuesV414";
import {DEFAULT_RAP_PERFORMANCE_V408,normalizeRapEditorV408,type RapPerformanceEditorGainV408,type RapPerformanceEditorSettingsV408} from "./rapPerformanceEditorV408";

const sliders:ReadonlyArray<{key:RapPerformanceEditorGainV408;label:string;hint:string}>=[
  {key:"head",label:"Kopfbewegung",hint:"Nicken auf Snare und Wortakzente"},
  {key:"gestures",label:"Arme und Gesten",hint:"Zusätzliche Hand- und Schulterbewegungen"},
  {key:"verse",label:"Verse-Dynamik",hint:"Zurückhaltende Akzente während Rap-Verse"},
  {key:"hook",label:"Hook-Dynamik",hint:"Offenere Gesten im Refrain"},
  {key:"kick",label:"Kick-Reaktion",hint:"Brust- und Oberkörperakzente bei gemessenen Kicks"},
  {key:"snare",label:"Snare-Reaktion",hint:"Kopfnicken bei gemessenen Snare-Transienten"},
  {key:"lipSync",label:"Lip-Sync",hint:"Multiplikator für die vorhandene Mundstärke"},
];
const pct=(n:number)=>Math.max(0,Math.min(1.5,n/100));

/** Lightweight schematic, animated 3-D figure. Deliberately does not imply
 * retargeted GLB or real audio/source separation. Demo beats are local only. */
function DemoFigure({settings,section,playing,reducedMotion,mouthPreviewV418}:{settings:RapPerformanceEditorSettingsV408;section:"verse"|"hook";playing:boolean;reducedMotion:boolean;mouthPreviewV418:number|null}){
  const torso=useRef<Group>(null),head=useRef<Group>(null),left=useRef<Group>(null),right=useRef<Group>(null),mouth=useRef<Mesh>(null),clock=useRef(0);
  useFrame((_,delta)=>{
    if(playing&&!reducedMotion)clock.current+=Math.min(.08,delta);
    const t=clock.current;
    const active=playing&&!reducedMotion?1:0;
    const accent=active;
    const beat=t*2.2,phase=(beat%1+1)%1;
    const kick=Math.exp(-phase*13)*accent*pct(settings.kick);
    const snare=Math.exp(-((phase+.5)%1)*13)*accent*pct(settings.snare);
    const flow=Math.max(0,Math.sin(t*9))*accent*pct(section==="hook"?settings.hook:settings.verse);
    const headNod=(snare*.15+flow*.045)*pct(settings.head);
    const hands=(snare*.22+flow*(section==="hook"?.20:.08))*pct(settings.gestures);
    if(torso.current){torso.current.rotation.x=-.10*kick;torso.current.rotation.z=Math.sin(t*2.4)*.026*accent;torso.current.position.y=-kick*.065;}
    if(head.current){head.current.rotation.x=-headNod;head.current.rotation.z=Math.sin(t*2.1)*.04*accent;}
    if(left.current)left.current.rotation.z=-.20-hands;
    if(right.current)right.current.rotation.z=.20+hands;
    if(mouth.current){const amp=mouthPreviewV418===null?Math.max(.055,Math.abs(Math.sin(t*11))*pct(settings.lipSync)*.28*accent):Math.max(.015,Math.min(1,mouthPreviewV418)*pct(settings.lipSync)*.36*accent);mouth.current.scale.y=amp;}
  });
  return <group position={[0,-.20,0]}>
    <mesh position={[0,-1.17,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.86,32]}/><meshBasicMaterial color="#14243b" transparent opacity={.65}/></mesh>
    <group ref={torso}>
      <mesh position={[0,-.05,0]}><capsuleGeometry args={[.37,.73,6,16]}/><meshStandardMaterial color="#6959dd" metalness={.2} roughness={.55}/></mesh>
      <mesh position={[0,-.19,.3]}><boxGeometry args={[.26,.11,.09]}/><meshStandardMaterial color="#20d0e5" emissive="#035d7d" emissiveIntensity={.5}/></mesh>
      <group ref={left} position={[-.46,.21,0]}><mesh position={[-.055,-.4,0]} rotation={[0,0,-.06]}><capsuleGeometry args={[.135,.60,5,12]}/><meshStandardMaterial color="#8c89e8"/></mesh><mesh position={[-.07,-.86,0]}><sphereGeometry args={[.14,14,12]}/><meshStandardMaterial color="#dfae96"/></mesh></group>
      <group ref={right} position={[.46,.21,0]}><mesh position={[.055,-.4,0]} rotation={[0,0,.06]}><capsuleGeometry args={[.135,.60,5,12]}/><meshStandardMaterial color="#8c89e8"/></mesh><mesh position={[.07,-.86,0]}><sphereGeometry args={[.14,14,12]}/><meshStandardMaterial color="#dfae96"/></mesh></group>
      <mesh position={[-.19,-1,0]}><capsuleGeometry args={[.165,.50,6,12]}/><meshStandardMaterial color="#253049"/></mesh>
      <mesh position={[.19,-1,0]}><capsuleGeometry args={[.165,.50,6,12]}/><meshStandardMaterial color="#253049"/></mesh>
      <group ref={head} position={[0,.85,0]}>
        <mesh><sphereGeometry args={[.39,24,18]}/><meshStandardMaterial color="#dfae96" roughness={.8}/></mesh>
        <mesh position={[0,.265,-.01]} scale={[1,.4,1]}><sphereGeometry args={[.41,20,12]}/><meshStandardMaterial color="#211a34" roughness={.8}/></mesh>
        <mesh position={[-.145,.055,.35]}><sphereGeometry args={[.04,12,8]}/><meshBasicMaterial color="#172033"/></mesh>
        <mesh position={[.145,.055,.35]}><sphereGeometry args={[.04,12,8]}/><meshBasicMaterial color="#172033"/></mesh>
        <mesh ref={mouth} position={[0,-.17,.36]} scale={[1,.055,1]}><sphereGeometry args={[.19,16,10]}/><meshBasicMaterial color="#5a213c"/></mesh>
      </group>
    </group>
  </group>;
}

/** Only a broken preview is replaced, never the rest of the settings dialog or the live stage. */
class PreviewErrorBoundaryV409 extends Component<{children:ReactNode;onFallback:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error:Error){console.warn("V409 avatar preview could not load:",error.message);}
  render(){return this.state.failed
    ?<div role="alert" style={{padding:16}}>GLB-Vorschau konnte nicht geladen werden (Datei, Netzwerk oder CORS). <button type="button" onClick={this.props.onFallback}>Schematische Vorschau wählen</button></div>
    :this.props.children;}
}

export function RapPerformanceEditorV408({models=[],onRefresh,libraryLoading=false}:{models?:ReadonlyArray<AvatarModel>;onRefresh?:()=>void;libraryLoading?:boolean}){
  const {preferences,updatePreferences}=useUiPreferences();
  const settings=normalizeRapEditorV408(preferences.rapPerformanceEditorV408);
  const [section,setSection]=useState<"verse"|"hook">("verse");
  const [playing,setPlaying]=useState(true);
  const [previewId,setPreviewId]=useState(()=>preferences.avatarModelId);
  const [rigInfo,setRigInfo]=useState<RapRigInfoV409|null>(null);
  const [installedMotions,setInstalledMotions]=useState<InstalledCharacterMotion[]>([]);
  const [embeddedNames,setEmbeddedNames]=useState<string[]>([]);
  const [motionId,setMotionId]=useState("");
  const [motionSpeed,setMotionSpeed]=useState(1);
  const [motionInfo,setMotionInfo]=useState<RapMotionInfoV410|null>(null);
  const [timelineMode,setTimelineMode]=useState(false);
  const [timelineItems,setTimelineItems]=useState<RapTimelineItemV411[]>([]);
  const [timelineAvatarLoaded,setTimelineAvatarLoaded]=useState("");
  const [timelineClock,setTimelineClock]=useState(0);
  const [timelineLoop,setTimelineLoop]=useState(true);
  const [timelineSeek,setTimelineSeek]=useState({position:0,token:0});
  const [mouthPreviewV418,setMouthPreviewV418]=useState<number|null>(null);
  const onPreviewMouthV418=useCallback((jaw:number|null)=>setMouthPreviewV418(jaw),[]);
  const [previewGestureV414,setPreviewGestureV414]=useState<RapGestureSampleV414>({head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false});
  const [presetLibraryV412,setPresetLibraryV412]=useState<RapPresetLibraryV412>({version:1,presets:[]});
  const [presetNameV412,setPresetNameV412]=useState("Rap-Choreografie");
  const [presetIdV412,setPresetIdV412]=useState("");
  const [presetModeV412,setPresetModeV412]=useState<"timeline"|"section">("section");
  const [presetMessageV412,setPresetMessageV412]=useState("");
  useEffect(()=>{
    const refresh=()=>setPresetLibraryV412(loadRapPresetLibraryV412());
    refresh();window.addEventListener(RAP_PRESETS_CHANGE_V412,refresh);window.addEventListener("storage",refresh);
    return()=>{window.removeEventListener(RAP_PRESETS_CHANGE_V412,refresh);window.removeEventListener("storage",refresh);};
  },[]);
  useEffect(()=>{
    const refresh=()=>setInstalledMotions(loadCharacterMotionStore().motions);
    refresh();window.addEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);
    return()=>window.removeEventListener(CHARACTER_MOTION_CHANGE_EVENT,refresh);
  },[]);
  const onEmbeddedClips=useCallback((names:string[])=>setEmbeddedNames(names),[]);
  const onMotionInfo=useCallback((info:RapMotionInfoV410)=>setMotionInfo(info),[]);
  const onRigInfo=useCallback((info:RapRigInfoV409)=>setRigInfo(info),[]);
  const available=previewModelsV409(models);
  const current=selectedPreviewModelV409(available,previewId,preferences.avatarModelId);
  const isReal=Boolean(current?.url);
  // Persist only preview slot IDs and timing per avatar; never modify live choreography.
  const timelineStorageKey=`sonic.rap.motion.timeline.v411.${current?.id??"procedural"}`;
  useEffect(()=>{
    let parsed:unknown=[];
    try{parsed=JSON.parse(window.localStorage.getItem(timelineStorageKey)??"[]");}catch{/* stale or blocked storage */}
    setTimelineItems(normalizeRapTimelineV411(parsed));setTimelineClock(0);
    setTimelineSeek(old=>({position:0,token:old.token+1}));
    setTimelineAvatarLoaded(current?.id??"procedural");
  },[current?.id,timelineStorageKey]);
  useEffect(()=>{
    if(timelineAvatarLoaded!==(current?.id??"procedural"))return;
    try{window.localStorage.setItem(timelineStorageKey,JSON.stringify(timelineItems));}catch{/* private mode: live editing still works */}
  },[timelineItems,timelineAvatarLoaded,current?.id,timelineStorageKey]);
  const previewMotions=useMemo(()=>availableRapPreviewMotionsV410(current?.id??"",installedMotions,embeddedNames,current?.animationUrl),[current?.id,current?.animationUrl,installedMotions,embeddedNames]);
  const selectedMotion=useMemo(()=>selectedRapPreviewMotionV410(previewMotions,motionId),[previewMotions,motionId]);
  const currentPresetsV412=useMemo(()=>presetLibraryV412.presets.filter(p=>p.avatarId===current?.id),[presetLibraryV412,current?.id]);
  const selectedPresetV412=currentPresetsV412.find(p=>p.id===presetIdV412)??null;
  const activePresetV412=preferences.rapLivePresetV412?.avatarId===current?.id?preferences.rapLivePresetV412:null;
  const presetMissingV412=selectedPresetV412?checkRapPresetMotionsV412(selectedPresetV412,installedMotions.filter(m=>m.avatarId===current?.id).map(m=>m.id),embeddedNames.length):[];
  const timelinePlan=useMemo(()=>scheduleRapTimelineV411(timelineItems),[timelineItems]);
  const timelineFrame=useMemo(()=>sampleRapTimelineV411(timelineItems,timelineClock,timelineLoop),[timelineItems,timelineClock,timelineLoop]);
  const timelineEnabled=timelineMode&&isReal;
  const visibleSection=timelineEnabled&&timelineItems.length?timelineFrame.section:section;
  const gestureMotionV414=previewGestureV414.motionId&&previewGestureV414.motionBlend>0?previewMotions.find(m=>m.id===previewGestureV414.motionId)??null:null;
  const previewSettingsV414=useMemo(()=>previewGestureV414.active?{...settings,enabled:true,head:Math.min(150,(settings.enabled?settings.head:100)*previewGestureV414.head),gestures:Math.min(150,(settings.enabled?settings.gestures:100)*previewGestureV414.arms)}:settings,[settings,previewGestureV414]);
  const onPreviewGestureV414=useCallback((sample:RapGestureSampleV414)=>setPreviewGestureV414(sample),[]);
  const seekTo=useCallback((position:number)=>{
    setTimelineClock(position);setTimelineSeek(old=>({position,token:old.token+1}));
  },[]);
  const patchTimeline=(id:string,patch:Partial<RapTimelineItemV411>)=>setTimelineItems(items=>normalizeRapTimelineV411(items.map(item=>item.id===id?{...item,...patch}:item)));
  const onTimelineClock=useCallback((seconds:number)=>setTimelineClock(seconds),[]);
  const changeAvatar=(id:string)=>{setPreviewId(id);setRigInfo(null);setEmbeddedNames([]);setMotionId("");setMotionInfo(null);setTimelineClock(0);setPreviewGestureV414({head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false});};
  const set=(patch:Partial<RapPerformanceEditorSettingsV408>)=>updatePreferences({rapPerformanceEditorV408:normalizeRapEditorV408({...settings,...patch})});
  const savePresetV412=()=>{
    if(!current?.id||!isReal||!timelineItems.length)return;
    const id=`rap${Date.now().toString(36)}${Math.random().toString(36).slice(2,7)}`;
    const preset=normalizeRapPresetV412({id,name:presetNameV412,avatarId:current.id,loop:timelineLoop,mode:presetModeV412,items:timelineItems});
    if(!preset){setPresetMessageV412("Bitte einen Namen und mindestens einen gültigen Clip wählen.");return;}
    try{setPresetLibraryV412(saveRapPresetLibraryV412(upsertRapPresetV412(presetLibraryV412,preset)));setPresetIdV412(id);setPresetMessageV412(`„${preset.name}“ gespeichert.`);}
    catch{setPresetMessageV412("Speichern nicht möglich (Browser-Speicher blockiert).");}
  };
  const activatePresetV412=()=>{
    const preset=selectedPresetV412;
    if(!preset||!current?.id)return;
    if(preferences.avatarModelId!==preset.avatarId){setPresetMessageV412("Zuerst diesen Avatar als Live-Avatar auswählen. Die Vorschau ändert die Live-Besetzung nicht.");return;}
    if(preferences.avatarTimelineEnabled){setPresetMessageV412("Vorher die bestehende Live-Motion-Timeline deaktivieren. Sie wird nicht überschrieben.");return;}
    if(presetMissingV412.length){setPresetMessageV412(`${presetMissingV412.length} nicht verfügbare Motion(s). Bitte installieren oder aus dem Preset entfernen.`);return;}
    updatePreferences({rapLivePresetV412:preset});setPresetMessageV412(`„${preset.name}“ für die Live-Show aktiviert. Manuelle Choreografien behalten Vorrang.`);
  };
  return <fieldset className="v408-rap-editor" aria-label="V414 Rap Performance Editor" style={{margin:"14px 0",border:"1px solid #454a6a",borderRadius:12,padding:16}}>
    <legend>V414 · Rap Performance Editor, Lyrics & Live-Presets</legend>
    <p>Mehrere Tanz-Motions auf einer Timeline kombinieren, Crossfades und Verse/Hook einstellen und Rap-Gesten darüberlegen. Nur die aktivierten Performance-Regler wirken auf die Live-Show; die Timeline bleibt eine unabhängige Vorschau.</p>
    <label className="setting-check"><input type="checkbox" checked={settings.enabled} onChange={e=>set({enabled:e.target.checked})}/> Editor-Werte auf die Live-Show anwenden</label>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(235px,1fr))",gap:18,alignItems:"start"}}>
      <div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
          <label>Vorschau-Avatar <select aria-label="Vorschau-Avatar" value={current?.id??""} onChange={e=>changeAvatar(e.target.value)}>
            {available.map(model=><option key={model.id} value={model.id}>{model.label}{model.id===preferences.avatarModelId?" (Live-Auswahl)":""}</option>)}
          </select></label>
          {onRefresh&&<button type="button" onClick={onRefresh} disabled={libraryLoading}>{libraryLoading?"Lade Modelle…":"↻ Avatar-Liste aktualisieren"}</button>}
          {isReal&&!timelineEnabled&&<label>Vorschau-Motion <select aria-label="Vorschau-Motion" value={selectedMotion?.id??""} onChange={e=>{setMotionId(e.target.value);setMotionInfo(null);}}>
            <option value="">Keine · nur Rap-Gesten</option>
            {previewMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select></label>}
          {isReal&&<label>Motion-Tempo <select aria-label="Motion-Tempo" value={motionSpeed} onChange={e=>setMotionSpeed(previewMotionSpeedV410(Number(e.target.value)))}>
            <option value={.5}>0,5×</option><option value={.75}>0,75×</option><option value={1}>1×</option><option value={1.25}>1,25×</option><option value={1.5}>1,5×</option>
          </select></label>}
          {!timelineEnabled&&<label>Vorschau-Abschnitt <select aria-label="Vorschau-Abschnitt" value={section} onChange={e=>setSection(e.target.value as "verse"|"hook")}><option value="verse">Verse</option><option value="hook">Hook</option></select></label>}
          {isReal&&<label className="setting-check"><input type="checkbox" checked={timelineMode} onChange={e=>{setTimelineMode(e.target.checked);seekTo(0);}}/> Motion-Timeline V411</label>}
          <button type="button" onClick={()=>setPlaying(v=>!v)} aria-pressed={playing}>{playing?"Pause":"Abspielen"}</button>
        </div>
        <PreviewErrorBoundaryV409 key={current?.url??"procedural"} onFallback={()=>changeAvatar("procedural")}>
          <div role="img" aria-label={`${isReal?"Installierter GLB-Avatar":"Schematischer Avatar"}: ${current?.label??"Demomodell"}, ${visibleSection}, simulierter Rhythmus`} style={{height:300,minHeight:220,background:"radial-gradient(ellipse at center,#22294d,#0d1429)",borderRadius:12,overflow:"hidden"}}>
            <Canvas camera={{position:[0,.16,4.3],fov:43}} dpr={[1,1.5]} gl={{antialias:true}}>
              <ambientLight intensity={1.1}/><directionalLight position={[2,4,4]} intensity={2}/><OrbitControls enablePan={false} minDistance={2.5} maxDistance={7} enableDamping/>
              {isReal&&current?.url?
                <Suspense fallback={null}><RapRealAvatarPreviewV409 key={current.id} url={current.url} mouthPreviewV418={mouthPreviewV418} settings={previewSettingsV414} section={visibleSection} playing={playing} reducedMotion={preferences.reducedMotion} rigProfile={preferences.avatarRigProfile} onRigInfo={onRigInfo} onEmbeddedClips={onEmbeddedClips} motion={gestureMotionV414??(timelineEnabled?null:selectedMotion)} motionSpeed={motionSpeed} onMotionInfo={onMotionInfo} timeline={timelineEnabled&&!gestureMotionV414?timelineItems:undefined} timelineMotions={previewMotions} timelineLoop={timelineLoop} timelineSeek={timelineSeek} onTimelineClock={onTimelineClock}/></Suspense>
                :<DemoFigure settings={previewSettingsV414} section={visibleSection} playing={playing} reducedMotion={preferences.reducedMotion} mouthPreviewV418={mouthPreviewV418}/>}
            </Canvas>
          </div>
        </PreviewErrorBoundaryV409>
        {isReal&&<div role="status" style={{marginTop:6,fontSize:12}}>
          <strong>{current?.label}</strong> · {rigInfo?`${rigInfo.parts.length} Rig-Komponenten erkannt · ${rigInfo.mouth?"Mundsteuerung vorhanden":"Mundsteuerung im Modell nicht erkannt"}`:"GLB wird geladen …"}
          {rigInfo&&!rigInfo.parts.length&&<p>{rigInfo.note}</p>}
        </div>}
        {isReal&&timelineEnabled&&<div className="v411-motion-timeline" style={{margin:"14px 0",padding:12,border:"1px solid #596589",borderRadius:8}}>
          <strong>V411 · Visuelle Motion-Timeline</strong>
          <p style={{margin:"6px 0",fontSize:12}}>Clips kombinieren und überblenden. Jeder Abschnitt kann Verse oder Hook enthalten. Alle Einstellungen gelten nur für die Vorschau.</p>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <label>Clip hinzufügen <select aria-label="Timeline-Motion auswählen" value={motionId} onChange={e=>setMotionId(e.target.value)}>
              <option value="">Motion auswählen …</option>
              {previewMotions.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
            </select></label>
            <button type="button" disabled={!selectedMotion||timelineItems.length>=RAP_TIMELINE_MAX_V411} onClick={()=>{if(selectedMotion)setTimelineItems(items=>appendRapTimelineItemV411(items,selectedMotion.id,section));}}>+ Clip</button>
            <label className="setting-check"><input type="checkbox" checked={timelineLoop} onChange={e=>setTimelineLoop(e.target.checked)}/> Loop</label>
            <button type="button" disabled={!timelineItems.length} onClick={()=>seekTo(0)}>↺ Anfang</button>
            <button type="button" disabled={!timelineItems.length} onClick={()=>{if(window.confirm("Nur die lokale Vorschau-Timeline dieses Avatars leeren?")){setTimelineItems([]);seekTo(0);}}}>Timeline leeren</button>
          </div>
          <div aria-label="Timeline-Übersicht" style={{display:"flex",height:25,overflow:"hidden",borderRadius:5,background:"#11182b",margin:"12px 0 6px"}}>
            {timelinePlan.segments.map((item,index)=><button key={item.id} type="button" title={`${index+1}: ${previewMotions.find(m=>m.id===item.motionId)?.name??item.motionId} · ${item.section}`} onClick={()=>seekTo(item.startSec)} style={{minWidth:2,width:`${timelinePlan.duration?item.durationSec/timelinePlan.duration*100:100}%`,flexShrink:1,background:index%2?"#357aab":"#6959bd",color:"white",border:"1px solid #151e36",fontSize:11,overflow:"hidden"}}>{index+1} {item.section==="hook"?"Hook":"Verse"}</button>)}
          </div>
          <label style={{display:"block"}}>Position: {timelineFrame.time.toFixed(1)} / {timelinePlan.duration.toFixed(1)} s · {visibleSection==="hook"?"Hook":"Verse"}
            <input type="range" aria-label="Timeline-Position" min={0} max={Math.max(.01,timelinePlan.duration)} step="0.05" value={Math.min(timelineFrame.time,timelinePlan.duration)} onChange={e=>seekTo(Number(e.target.value))} disabled={!timelinePlan.duration} style={{width:"100%"}}/>
          </label>
          <ol style={{paddingLeft:22,display:"grid",gap:9,fontSize:12}}>
            {timelineItems.map((item,index)=><li key={item.id} style={{padding:"6px 0",borderBottom:"1px solid #313a58"}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                <strong>{index+1}. {previewMotions.find(m=>m.id===item.motionId)?.name??"Motion nicht mehr installiert"}</strong>
                <button type="button" aria-label={`Clip ${index+1} nach oben`} disabled={index===0} onClick={()=>setTimelineItems(items=>moveRapTimelineItemV411(items,index,-1))}>↑</button>
                <button type="button" aria-label={`Clip ${index+1} nach unten`} disabled={index===timelineItems.length-1} onClick={()=>setTimelineItems(items=>moveRapTimelineItemV411(items,index,1))}>↓</button>
                <button type="button" aria-label={`Clip ${index+1} entfernen`} onClick={()=>setTimelineItems(items=>items.filter(x=>x.id!==item.id))}>✕</button>
              </div>
              <div style={{display:"flex",gap:9,alignItems:"center",flexWrap:"wrap",marginTop:5}}>
                <label>Abschnitt <select aria-label={`Abschnitt Clip ${index+1}`} value={item.section} onChange={e=>patchTimeline(item.id,{section:e.target.value as "verse"|"hook"})}><option value="verse">Verse</option><option value="hook">Hook</option></select></label>
                <label>Dauer (s) <input aria-label={`Dauer Clip ${index+1}`} type="number" min={1} max={30} step={.5} value={item.durationSec} onChange={e=>patchTimeline(item.id,{durationSec:Number(e.target.value)})} style={{width:67}}/></label>
                <label>Rap-Akzent (%) <input aria-label={`Rap-Akzent Clip ${index+1}`} type="number" min={0} max={150} step={10} value={item.rapGain} onChange={e=>patchTimeline(item.id,{rapGain:Number(e.target.value)})} style={{width:62}}/></label>
                <label>Überblendung (s) <input aria-label={`Überblendung Clip ${index+1}`} type="number" min={0} max={4} step={.1} value={index===timelineItems.length-1?0:item.crossfadeSec} disabled={index===timelineItems.length-1} onChange={e=>patchTimeline(item.id,{crossfadeSec:Number(e.target.value)})} style={{width:67}}/></label>
              </div>
            </li>)}
          </ol>
          <section className="v412-rap-presets" aria-label="V412 Choreografie-Presets" style={{marginTop:15,borderTop:"1px solid #596589",paddingTop:12,display:"grid",gap:9}}>
            <strong>V412 · Choreografie-Presets & Live-Show</strong>
            <small>Preset-Daten enthalten nur Clip-IDs und Zeitwerte. Kein Upload; Speicherung lokal im Browser und immer für genau einen Avatar.</small>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
              <label>Preset-Name <input aria-label="Preset-Name V412" value={presetNameV412} maxLength={72} onChange={e=>setPresetNameV412(e.target.value)} style={{maxWidth:180}}/></label>
              <label>Automatik <select aria-label="Preset-Automatik V412" value={presetModeV412} onChange={e=>setPresetModeV412(e.target.value as "timeline"|"section")}>
                <option value="section">Verse/Hook aus Musik</option><option value="timeline">Zeitgesteuerte Timeline</option>
              </select></label>
              <button type="button" onClick={savePresetV412} disabled={!timelineItems.length}>Als neues Preset speichern</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
              <label>Gespeicherte Presets <select aria-label="Gespeichertes Rap-Preset V412" value={selectedPresetV412?.id??""} onChange={e=>{setPresetIdV412(e.target.value);setPresetMessageV412("");}}>
                <option value="">Preset auswählen …</option>
                {currentPresetsV412.map(p=><option key={p.id} value={p.id}>{p.name} ({p.items.length} Clips)</option>)}
              </select></label>
              <button type="button" disabled={!selectedPresetV412} onClick={()=>{if(!selectedPresetV412)return;setTimelineItems(selectedPresetV412.items);setTimelineLoop(selectedPresetV412.loop);setPresetNameV412(selectedPresetV412.name);setPresetModeV412(selectedPresetV412.mode);seekTo(0);setPresetMessageV412("Preset in Vorschau geladen. Live-Show unverändert.");}}>In Vorschau laden</button>
              <button type="button" disabled={!selectedPresetV412||!!presetMissingV412.length||preferences.avatarModelId!==current?.id||!!preferences.avatarTimelineEnabled} onClick={activatePresetV412}>Für Live-Show aktivieren</button>
              <button type="button" disabled={!activePresetV412} onClick={()=>{updatePreferences({rapLivePresetV412:null});setPresetMessageV412("Live-Preset deaktiviert.");}}>Live-Preset deaktivieren</button>
              <button type="button" disabled={!selectedPresetV412} onClick={()=>{if(!selectedPresetV412||!window.confirm(`Preset „${selectedPresetV412.name}“ löschen?`))return;try{setPresetLibraryV412(saveRapPresetLibraryV412(removeRapPresetV412(presetLibraryV412,selectedPresetV412.id)));if(activePresetV412?.id===selectedPresetV412.id)updatePreferences({rapLivePresetV412:null});setPresetIdV412("");setPresetMessageV412("Preset gelöscht.");}catch{setPresetMessageV412("Löschen nicht möglich.");}}}>Preset löschen</button>
            </div>
            {activePresetV412&&<small role="status">Live aktiv: {activePresetV412.name} ({activePresetV412.mode==="section"?"automatischer Verse/Hook-Wechsel":"Timeline"})</small>}
            {preferences.avatarModelId!==current?.id&&<small>Für die Live-Aktivierung zuerst den gleichen Charakter als Live-Avatar auswählen.</small>}
            {preferences.avatarTimelineEnabled&&<small>Die bestehende Live-Motion-Timeline hat Vorrang; vor Aktivierung separat deaktivieren.</small>}
            {!!presetMissingV412.length&&<small role="alert">Nicht installierte oder nicht unterstützte Clips: {presetMissingV412.join(", ")}</small>}
            {!!presetMessageV412&&<small role="status">{presetMessageV412}</small>}
          </section>
          <small>{timelineItems.length}/{RAP_TIMELINE_MAX_V411} Clips · Speicherung pro Avatar im Browser · Übergänge werden maximal auf die Hälfte der Nachbarclips begrenzt. Nicht ladbare Motions bleiben in der Liste, werden aber nicht animiert.</small>
        </div>}
        <RapLyricsGestureTimelineV414 avatarId={current?.id??""} motions={previewMotions} onPreviewGesture={onPreviewGestureV414}/>
        <RapPerformanceQualityInspectorV418 avatarId={current?.id??""} motions={previewMotions} onPreviewGesture={onPreviewGestureV414} onPreviewMouth={onPreviewMouthV418}/>
        <RapPerformanceInspectorPanelV426 avatarId={current?.id??""} onPreviewGesture={onPreviewGestureV414} onPreviewMouth={onPreviewMouthV418}/>
        <RapSyllableTimelineEditorV420 onPreviewMouth={onPreviewMouthV418}/>
        <RapAudioAwarePanelV423/>
        {isReal&&<div role="status" style={{marginTop:6,fontSize:12}}>{motionInfo?.message??(selectedMotion?"Motion wird vorbereitet …":previewMotions.length?`${previewMotions.length} verfügbare Tanz-Motions`:"Keine installierten oder eingebetteten Tanz-Motions für diesen Avatar")}</div>}
        <small>{isReal?"V411 zeigt echte GLB-/GLTF-Avatare und spielt ausgewählte eingebettete oder installierte Tanz-Clips ab. Externe Animationen werden mit dem vorhandenen Humanoid-Retargeting übertragen; nicht passende Tracks können fehlen. Kopf-/Arm-/Körperbewegungen benötigen Rig-Knochen; Lip-Sync benötigt Jaw-Bone oder Mouth-Morph.":"Schematisches Demomodell, falls kein installiertes GLB ausgewählt ist."} Die Vorschau arbeitet mit simulierten Beat-Impulsen; Rap-Wörter sind ebenfalls simuliert, nicht live analysiert. Reduzierte Bewegung stoppt die Vorschau. Das Modell lässt sich mit der Maus drehen und zoomen. Die Live-Avatar-Auswahl wird nicht verändert.</small>
      </div>
      <div style={{display:"grid",gap:10}}>
        {sliders.map(({key,label,hint})=><label key={key} style={{display:"block"}}>
          <span style={{display:"flex",justifyContent:"space-between",gap:8}}><strong>{label}</strong><span>{settings[key]} %</span></span>
          <input aria-label={label} type="range" min="0" max="150" step="5" value={settings[key]} onChange={e=>set({[key]:Number(e.target.value)})} style={{width:"100%"}}/>
          <small>{hint}</small>
        </label>)}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button type="button" onClick={()=>set({...DEFAULT_RAP_PERFORMANCE_V408,enabled:true})}>Standardwerte</button>
          <button type="button" onClick={()=>set({enabled:false})}>Live-Steuerung ausschalten</button>
        </div>
      </div>
    </div>
    <small>0 % unterdrückt den jeweiligen Zusatzakzent, 100 % entspricht dem V407-Verhalten, maximal 150 %. Mundstärke multipliziert die vorhandene Lip-Sync-Stärke; manuelle Animationen, reduzierte Bewegung, Pausen und Sängerrollen haben Vorrang. Kick/Snare in der Show nur mit gemessenen Mikrofonsignalen.</small>
  </fieldset>;
}
