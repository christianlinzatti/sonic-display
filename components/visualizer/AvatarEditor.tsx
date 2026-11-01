"use client";
import {usePreviewGltfCacheV654} from "./usePreviewGltfCacheV654";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { Group, Object3D } from "three";
import {clone as cloneSkinnedScene} from "three/examples/jsm/utils/SkeletonUtils.js";
import {collectAvatarRigNodes, applyAvatarRigMotion, type AvatarRigMotion} from './avatarRigController';
import {createFootIKState, initializeFootIK, updateFootIK} from './avatarFootIK';
import {blendHipDanceV735, normalizeHipDanceV735, type HipDanceModeV735} from './hipDanceV735';
import {createHipStudioStateV738,resetHipStudioV738,sampleHipStudioV738,type HipStudioSettingsV738} from './hipMotionStudioV738';
import {createDanceVarietyStateV759,stepDanceVarietyV759,type DanceVarietySettingsV759} from './intelligentDanceVarietyV759';
import {directGenreHipV742, type GenreHipSettingsV742} from './genreHipIntelligenceV742';
import {createSmartHipStateV744,directSmartHipV744,type SmartHipSettingsV744} from './smartHipChoreographyV744';
import {createEnsembleHipStateV745,directEnsembleHipV745,type EnsembleHipSettingsV745} from './multiAvatarHipSyncV745';
import {createBeatBassStateV743,sampleBeatBassV743,type BeatBassSettingsV743} from './beatBassHipMotionV743';
import {sampleNaturalBodyV740,blendNaturalBodyV740,type NaturalBodySettingsV740} from './naturalBodyDynamicsV740';
import {collectGluteRigV741,createGluteOverlayV741,applyGluteRigV741,sampleGluteV741,describeGluteRigV741,supportsGluteDriverV741,normalizeGluteSettingsV741,type GluteSettingsV741} from './advancedGluteRigV741';
import {HIP_GLB_NAMES_V739,resolveClipAvailabilityV739,isHipGlbClipV739,exportHipMotionGlbV739,type HipGlbClipNameV739} from "./hipGlbMotionV739";
import { useVisualizer } from "@/context/VisualizerContext";
import { useAvatarModel } from "@/hooks/useAvatarModel";
import { avatarRigProfiles } from "./avatarRigProfiles";
import { avatarDancePresets } from "./avatarDancePresets";

function ProceduralPreview({ pulse, intensity }: { pulse: number; intensity: number }) {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    const target = Math.sin(performance.now() / 330) * 0.06 * intensity + pulse * 0.12 * intensity;
    group.current.rotation.y += (target - group.current.rotation.y) * Math.min(1, delta * 8);
    group.current.position.y += ((Math.sin(performance.now() / 250) * 0.035 * intensity + pulse * 0.06) - group.current.position.y) * Math.min(1, delta * 8);
  });
  return <group ref={group} position={[0, -0.55, 0]} scale={0.85}>
    <mesh position={[0, -0.2, 0]}><capsuleGeometry args={[0.48, 0.7, 6, 12]} /><meshStandardMaterial color="#7557d9" /></mesh>
    <mesh position={[0, 0.75, 0]}><sphereGeometry args={[0.43, 24, 18]} /><meshStandardMaterial color="#e7b99d" /></mesh>
    <mesh position={[0, 1.16, 0]}><sphereGeometry args={[0.27, 18, 12]} /><meshStandardMaterial color="#35264b" /></mesh>
  </group>;
}

function GltfPreview({ url, clip, playing, pulse, intensity, onClips, hipMode, hipStrength, hipSpeed, hipStudio, naturalBodyV740, naturalDanceV758, varietyV759, gluteV741, genreHipV742, beatBassV743, smartHipV744, ensembleHipV745, previewSlotV745, previewCountV745, demoBeatV743, audioSignalsV743, hipBpm, hipGenre, hipSection, onFootReport, onRigReport }: {
  url: string;
  clip: string | null;
  playing: boolean;
  pulse: number;
  intensity: number;
  onClips: (clips: string[]) => void;
  hipMode: HipDanceModeV735 | null;
  hipStrength: number;
  hipSpeed: number;
  hipStudio: Partial<HipStudioSettingsV738> | undefined;
  naturalBodyV740: Partial<NaturalBodySettingsV740> | undefined;
  naturalDanceV758:Partial<NaturalDanceSettingsV758>|undefined;
  varietyV759:Partial<DanceVarietySettingsV759>|undefined;
  gluteV741: Partial<GluteSettingsV741> | undefined;
  genreHipV742:Partial<GenreHipSettingsV742> | undefined;
  beatBassV743:Partial<BeatBassSettingsV743> | undefined;
  smartHipV744:Partial<SmartHipSettingsV744> | undefined;
  ensembleHipV745:Partial<EnsembleHipSettingsV745> | undefined;
  previewSlotV745:number;previewCountV745:number;
  demoBeatV743:boolean;
  audioSignalsV743:{kick?:number|null;beat?:number|null;bass?:number|null;attack?:number|null};
  hipBpm:number; hipGenre:string;hipSection:string;
  onFootReport:(report:string)=>void;
  onRigReport:(report:{hips:boolean;feet:boolean;upper:boolean;arms:boolean;gluteStatus:string;gluteReady:boolean})=>void;
}) {
  const root = useRef<Group>(null);
  const { scene, animations } = useGLTF(url);
  usePreviewGltfCacheV654(url);
  const { actions, names } = useAnimations(animations, root);
  const model = useMemo(() => cloneSkinnedScene(scene), [scene]);
  const targets = useMemo(() => collectAvatarRigNodes(model).targets,[model]);
  const gluteRigV741=useMemo(()=>collectGluteRigV741(model),[model]);
  const gluteOverlayV741=useMemo(()=>createGluteOverlayV741(),[model]);
  const footIK = useRef(createFootIKState());
  useEffect(()=>onRigReport({hips:!!targets.hips,feet:!!targets.leftFoot&&!!targets.rightFoot,upper:!!targets.chest,arms:!!targets.leftArm&&!!targets.rightArm,gluteReady:supportsGluteDriverV741(gluteRigV741,normalizeGluteSettingsV741(gluteV741).driver),gluteStatus:describeGluteRigV741(gluteRigV741,normalizeGluteSettingsV741(gluteV741).driver)}),[targets,gluteRigV741,gluteV741,onRigReport]);
  const elapsed = useRef(0);
  const hipStateV738=useRef(createHipStudioStateV738());
  const beatStateV743=useRef(createBeatBassStateV743());
  const smartStateV744=useRef(createSmartHipStateV744());
  const ensembleStateV745=useRef(createEnsembleHipStateV745());
  const danceStateV758=useRef(createNaturalDanceStateV758());
  const varietyStateV759=useRef(createDanceVarietyStateV759());
  const lastFootStatusV738=useRef('');
  const footReportAtV738=useRef(0);
  useEffect(() => { footIK.current = initializeFootIK(model,targets);elapsed.current=0;
    resetHipStudioV738(hipStateV738.current);lastFootStatusV738.current='';footReportAtV738.current=0;
  },[model,targets]);

  useEffect(() => onClips(names), [names, onClips]);

  useEffect(() => {
    for (const action of Object.values(actions)) action?.stop();
    if (playing && clip && actions[clip]) actions[clip].reset().fadeIn(0.18).play();
    return () => { if (clip) actions[clip]?.fadeOut(0.12); };
  }, [actions, clip, playing]);

  useFrame((_, delta) => {
    if (!root.current) return;
    if(playing)elapsed.current+=Math.min(.1,Math.max(0,delta));
    const genreHipPlanV742=directGenreHipV742({config:genreHipV742,
      hip:normalizeHipDanceV735({mode:hipMode??'off',strength:hipStrength,speed:hipSpeed}),
      studio:hipStudio,seconds:elapsed.current,bpm:hipBpm,genre:hipGenre,section:hipSection,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip});
    const smartHipPlanV744=directSmartHipV744(smartStateV744.current,{
      settings:smartHipV744,plan:genreHipPlanV742,
      originalHip:normalizeHipDanceV735({mode:hipMode??'off',strength:hipStrength,speed:hipSpeed}),
      trackId:url,seconds:elapsed.current,bpm:hipBpm,section:hipSection,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip});
    const ensembleHipPlanV745=directEnsembleHipV745(ensembleStateV745.current,{
      settings:ensembleHipV745,plan:smartHipPlanV744,slot:previewSlotV745,
      count:previewCountV745,trackId:url,seconds:elapsed.current,bpm:hipBpm,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,delta,
    });
    const hipFrameV738=sampleHipStudioV738(hipStateV738.current,{
      settings:ensembleHipPlanV745.hip,
      seconds:ensembleHipPlanV745.seconds,bpm:hipBpm,genre:hipGenre,section:hipSection,playing:playing&&!!hipMode,
      reducedMotion:false,manualPriority:!!clip,footIKEnabled:true,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      studio:ensembleHipPlanV745.studio,trackId:url,delta,
    });
    // Explicit preview demo only: real-stage audio signals are never faked.
    const phase=((elapsed.current%86400)*Math.min(190,Math.max(65,hipBpm))/60)%1;
    const demoPulse=phase<.16?1-phase/.16:0;
    const demo=demoBeatV743?{kick:demoPulse,beat:demoPulse,bass:.4+.35*Math.sin(elapsed.current*2.2)**2,attack:demoPulse}:audioSignalsV743;
    const v743=sampleBeatBassV743(beatStateV743.current,{
      pose:hipFrameV738.pose,mode:hipFrameV738.mode,poseStrength:hipFrameV738.effectiveStrength,settings:beatBassV743,
      seconds:elapsed.current,trackId:url,delta,bpm:hipBpm,genre:hipGenre,section:hipSection,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,
      footIKEnabled:true,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
      ...demo,
    });
    const hip=v743.pose;
    // Use the same additive controller as the live stage. No GLB asset edits.
    const neutral:AvatarRigMotion={headNod:0,headTurn:0,spineSway:0,hipSway:0,
      shoulderRoll:0,followThrough:0,headLag:0,chestPulse:0,armSwing:0,
      legGroove:0,footStep:0,weightShift:0,beatImpulse:0,expressionJaw:0,
      expressionBrow:0,expressionEyeNarrow:0,expressionHeadTilt:0};
    const naturalV740=sampleNaturalBodyV740({pose:hip,mode:hipFrameV738.mode,
      seconds:elapsed.current,playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,
      footIKEnabled:true,contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',settings:naturalBodyV740});
    const naturalV758=directNaturalDanceV758(danceStateV758.current,{
      settings:naturalDanceV758,hip,body:naturalV740,mode:hipFrameV738.mode,
      trackId:url,seconds:elapsed.current,delta,playing:playing&&!!hipMode,
      reducedMotion:false,manualPriority:!!clip,footIKEnabled:true,
      contactKnown:!!footIK.current.left&&!!footIK.current.right,
      plantedLeft:footIK.current.left?.contact.phase==='planted',
      plantedRight:footIK.current.right?.contact.phase==='planted',
    });
    const previewMotionV758=blendNaturalBodyV740(blendHipDanceV735(neutral,naturalV758.hip),naturalV758.body);
    // V759 preview uses a simulated clock / selected section (no inferred singer or clip).
    const previewVarietyV759=stepDanceVarietyV759(varietyStateV759.current,previewMotionV758,{
      settings:varietyV759,trackId:url,modelId:url,seconds:elapsed.current,
      delta,bpm:hipBpm,section:hipSection,genre:hipGenre,slot:previewSlotV745,
      playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,quality:'high',
    });
    varietyStateV759.current=previewVarietyV759.state;
    applyAvatarRigMotion(targets,previewVarietyV759.motion,delta);
    applyGluteRigV741(gluteRigV741,gluteOverlayV741,
      sampleGluteV741({pose:hip,mode:hipFrameV738.mode,playing:playing&&!!hipMode,reducedMotion:false,manualPriority:!!clip,settings:gluteV741}),gluteV741,delta);
    // IK follows the modified pelvis; only the existing solver may adjust legs.
    updateFootIK(footIK.current,root.current,delta,playing&&!!hipMode,.8,.6,.75);
    // Read only V135 contact state; this is NOT post-IK slip measurement.
    if(elapsed.current-footReportAtV738.current>.35 || !lastFootStatusV738.current){
      const contact=(side:typeof footIK.current.left)=>side?.contact.phase==='planted'?'Stand':side?.contact.phase==='airborne'||side?.contact.phase==='releasing'?'Schritt':side?'Übergang':'kein Rig';
      const status=`Kontakt links: ${contact(footIK.current.left)} · rechts: ${contact(footIK.current.right)}`;
      if(status!==lastFootStatusV738.current){onFootReport(status);lastFootStatusV738.current=status;}
      footReportAtV738.current=elapsed.current;
    }
    // In Studio preview, disable generic root bob/yaw that would defeat IK visualization.
    const target = hipMode ? 0 : pulse * 0.1 * intensity;
    root.current.rotation.y += (target - root.current.rotation.y) * Math.min(1, delta * 8);
    root.current.position.y += ((hipMode ? 0 : pulse * 0.05 * intensity) - root.current.position.y) * Math.min(1, delta * 8);
  });

  return <group ref={root} scale={0.9}><primitive object={model as Object3D} /></group>;
}

export function AvatarEditor() {
  const { preferences, audio, isPlaying, updatePreferences } = useVisualizer();
  const model = useAvatarModel(preferences.avatarModelId);
  const [clipSelectionV739,setClipSelectionV739]=useState('');
  const [clipInventoryV739,setClipInventoryV739]=useState<{url:string;names:string[]}|null>(null);
  const [rigInventoryV739,setRigInventoryV739]=useState<{url:string;hips:boolean;feet:boolean;upper:boolean;arms:boolean;gluteReady:boolean;gluteStatus:string}|null>(null);
  const [exportSelectedV739,setExportSelectedV739]=useState<HipGlbClipNameV739>('Hip_Sway');
  const [exportBusyV739,setExportBusyV739]=useState(false);
  const [exportStatusV739,setExportStatusV739]=useState('');
  const onClipsV739=useCallback((names:string[])=>{
    setClipInventoryV739({url:model.url??'',names});
  },[model.url]);
  const onRigReportV739=useCallback((report:{hips:boolean;feet:boolean;upper:boolean;arms:boolean;gluteReady:boolean;gluteStatus:string})=>{
    setRigInventoryV739({url:model.url??'',...report});
  },[model.url]);
  const clipReadyV739=!!model.url&&clipInventoryV739?.url===model.url;
  const clips=clipReadyV739?clipInventoryV739.names:[];
  const clipAvailabilityV739=resolveClipAvailabilityV739(clipSelectionV739,clips,clipReadyV739);
  const clip=clipAvailabilityV739.kind==='glb'?clipAvailabilityV739.clip:null;
  const proceduralV739=clipAvailabilityV739.kind==='procedural'&&isHipGlbClipV739(clipAvailabilityV739.clip??'')?
    clipAvailabilityV739.clip as HipGlbClipNameV739:null;
  async function exportMotionV739(mode:HipGlbClipNameV739){
    if(!model.url||exportBusyV739)return;
    setExportBusyV739(true);setExportStatusV739('');
    try{
      const file=await exportHipMotionGlbV739(model.url,mode,{
        bpm:studioBpmV738,strength:preferences.avatarHipDanceStrengthV735??45,
        speed:preferences.avatarHipDanceSpeedV735??100});
      const blobUrl=URL.createObjectURL(file);
      try{const a=document.createElement('a');a.href=blobUrl;a.download=file.name;
        document.body.appendChild(a);a.click();a.remove();}
      finally{window.setTimeout(()=>URL.revokeObjectURL(blobUrl),1000);}
      setExportStatusV739(`${file.name} wurde zum Herunterladen angeboten. Danach über den Motion-Installer für diesen Avatar hinzufügen.`);
    }catch(error){setExportStatusV739(error instanceof Error?error.message:'GLB-Export fehlgeschlagen.');}
    finally{setExportBusyV739(false);}
  }
  const [playing, setPlaying] = useState(true);
  const [testBeat, setTestBeat] = useState(false);
  const [studioPreviewV738,setStudioPreviewV738]=useState<HipDanceModeV735>('off');
  const [studioBpmV738,setStudioBpmV738]=useState(120);
  const [studioGenreV738,setStudioGenreV738]=useState('deutschrap');
  const [studioSectionV742,setStudioSectionV742]=useState('verse');
  const [previewCountV745,setPreviewCountV745]=useState(2);
  const [previewSlotV745,setPreviewSlotV745]=useState(0);
  const [demoBeatV743,setDemoBeatV743]=useState(false);
  const [footStatusV738,setFootStatusV738]=useState('Noch keine Kontaktmessung');
  const pulse = testBeat ? 1 : audio.beat ? audio.beatStrength : 0;

  useEffect(() => {
    setClipSelectionV739('');
    setClipInventoryV739(null);setRigInventoryV739(null);setExportStatusV739('');setFootStatusV738("Noch keine Kontaktmessung");
  }, [model.id]);

  useEffect(() => {
    if (!testBeat) return;
    const timer = window.setTimeout(() => setTestBeat(false), 420);
    return () => window.clearTimeout(timer);
  }, [testBeat]);

  return <section className="avatar-editor" aria-label="Avatar editor">
    <div className="avatar-editor-preview">
      <Canvas camera={{ position: [0, 0.2, 4], fov: 38 }} dpr={[1, 1.25]}>
        <ambientLight intensity={1.8} /><directionalLight position={[3, 4, 5]} intensity={2} />
        <Suspense fallback={<ProceduralPreview pulse={pulse} intensity={preferences.avatarAnimationIntensity} />}>
          {model.url ? <GltfPreview url={model.url} clip={studioPreviewV738!=='off'?null:clip} playing={playing} pulse={pulse} intensity={preferences.avatarAnimationIntensity} onClips={onClipsV739}
            hipMode={studioPreviewV738!=='off'?studioPreviewV738:proceduralV739}
            hipStrength={preferences.avatarHipDanceStrengthV735??45} hipSpeed={preferences.avatarHipDanceSpeedV735??100}
            hipStudio={preferences.avatarHipStudioV738} naturalBodyV740={preferences.avatarNaturalBodyV740} naturalDanceV758={preferences.avatarNaturalDanceV758} varietyV759={preferences.avatarDanceVarietyV759} gluteV741={preferences.avatarGluteRigV741} genreHipV742={preferences.avatarGenreHipV742} beatBassV743={preferences.avatarBeatBassV743} smartHipV744={preferences.avatarSmartHipV744} ensembleHipV745={preferences.avatarEnsembleHipV745} previewSlotV745={previewSlotV745} previewCountV745={previewCountV745} demoBeatV743={demoBeatV743} audioSignalsV743={{kick:audio.kickAccentIntensity,beat:audio.beatStrength,bass:audio.bass,attack:audio.attack}} hipBpm={studioBpmV738} hipGenre={studioGenreV738} hipSection={studioSectionV742} onFootReport={setFootStatusV738} onRigReport={onRigReportV739}/>
            : <ProceduralPreview pulse={pulse} intensity={preferences.avatarAnimationIntensity} />}
        </Suspense>
      </Canvas>
      <div className="avatar-editor-live">{isPlaying ? "LIVE AUDIO" : "PAUSED"}</div>
    </div>
    <div className="avatar-editor-controls">
      <div className="avatar-editor-actions">
        <button type="button" onClick={() => setPlaying(value => !value)}>{playing ? "Pause" : "Play"}</button>
        <button type="button" onClick={() => setTestBeat(true)}>Test beat</button>
      </div>
      {model.url && <><label>Rig profile
        <select value={preferences.avatarRigProfile} onChange={event => updatePreferences({ avatarRigProfile: event.target.value as typeof preferences.avatarRigProfile })}>
          {avatarRigProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
        </select>
      </label><label>Dance preset
        <select value={preferences.avatarDancePreset} onChange={event => updatePreferences({ avatarDancePreset: event.target.value as typeof preferences.avatarDancePreset })}>
          {avatarDancePresets.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        </select>
      </label></>}
      {model.url ? <>
        <label>Animation clip · V739
          <select value={clipSelectionV739} onChange={event=>setClipSelectionV739(event.target.value)}>
            <option value="">Auto / keine Animation</option>
            {clips.filter(name=>!isHipGlbClipV739(name)).map(name=><option key={name} value={`glb:${name}`}>{name} (GLB)</option>)}
            {HIP_GLB_NAMES_V739.map(name=><option key={`glb:${name}`} value={`glb:${name}`}>
              {name} (GLB{clipReadyV739&&!clips.includes(name)?' · NICHT vorhanden ⚠':''})
            </option>)}
            {HIP_GLB_NAMES_V739.map(name=><option key={`procedural:${name}`} value={`procedural:${name}`}>
              {name} (prozedural · ohne GLB-Clip)
            </option>)}
          </select>
        </label>
        {clipAvailabilityV739.message&&<p role={clipAvailabilityV739.kind==='missing'?'alert':'status'} className="avatar-editor-help">{clipAvailabilityV739.message}</p>}
      </> : <p className="avatar-editor-help">Der prozedurale Avatar hat keine GLB-Clips. Nutze „Test beat“ für die Vorschau.</p>}
      <fieldset><legend>Hip Motion Studio Vorschau · V738</legend>
        <label>Live-Bewegung<select value={studioPreviewV738} onChange={e=>setStudioPreviewV738(e.target.value as HipDanceModeV735)} disabled={!model.url}>
          <option value="off">Aus – normaler Clip</option><option value="auto">Auto (Musikphrasen)</option>
          <option value="Hip_Sway">Hip_Sway</option><option value="Hip_Circle">Hip_Circle</option><option value="Hip_Bounce">Hip_Bounce</option>
        </select></label>
        <label>Simulierte BPM ({studioBpmV738})<input type="range" min="65" max="190" step="5" value={studioBpmV738} onChange={e=>setStudioBpmV738(Number(e.target.value))} disabled={!model.url}/></label>
        <label>Stil<select value={studioGenreV738} onChange={e=>setStudioGenreV738(e.target.value)} disabled={!model.url}>
          <option value="deutschrap">Deutschrap</option><option value="hardtekk">Hardtekk</option><option value="hardstyle">Hardstyle</option><option value="pop">Pop</option><option value="rock">Rock</option>
        </select></label>
        <label>Songabschnitt · V742<select value={studioSectionV742} onChange={e=>setStudioSectionV742(e.target.value)} disabled={!model.url}>
          <option value="intro">Intro</option><option value="break">Break / Bridge</option><option value="verse">Verse</option>
          <option value="hook">Hook / Refrain</option><option value="build">Build-up</option><option value="drop">Drop</option><option value="outro">Outro</option>
        </select></label>
        <label><input type="checkbox" checked={demoBeatV743} onChange={e=>setDemoBeatV743(e.target.checked)} disabled={!model.url}/> V743: Simulierte Kick-/Bass-Signale (nur Vorschau)</label>
        <p role="status">V743 Beat &amp; Bass Motion: {demoBeatV743?'DEMO (kein echtes Audio)':'Audioanalyse-Signale; bei Stille keine Zusatzbewegung'}.
          {preferences.avatarBeatBassV743?.enabled===false?' Musikreaktion ist deaktiviert.':''} Feste GLB-Clips haben Vorrang.</p>
        <label>V745 Ensemble-Größe (Vorschau) <select value={previewCountV745} onChange={e=>{const count=Number(e.target.value);setPreviewCountV745(count);setPreviewSlotV745(s=>Math.min(s,count-1));}} disabled={!model.url}>
          <option value={1}>Solo</option><option value={2}>Duett</option><option value={3}>3 Performer</option><option value={4}>4 Performer</option>
        </select></label>
        <label>V745 Performer testen <select value={previewSlotV745} onChange={e=>setPreviewSlotV745(Number(e.target.value))} disabled={!model.url}>
          {Array.from({length:previewCountV745},(_,i)=><option key={i} value={i}>Avatar {i+1}</option>)}
        </select></label>
        <p role="status">V745 Multi-Avatar Dance Sync: Diese Einzelavatar-Vorschau simuliert die Rolle von Avatar {previewSlotV745+1} in einer {previewCountV745}er-Gruppe, nicht die gesamte Bühne. Aktuelle Konfiguration: {preferences.avatarEnsembleHipV745?.mode??'auto'}.</p>
        <p role="status">V744 Smart Choreography: {preferences.avatarSmartHipV744?.enabled===false?'ausgeschaltet':'aktiv bei V742-Auto-Modus'}. Die Vorschau verwendet gewählten BPM, Genre und Songabschnitt.</p>
        <p role="status">V742: Genre Dance Intelligence {preferences.avatarGenreHipV742?.enabled===false?'ausgeschaltet':'aktiv bei Auto-Modus'}.
          Feste Bewegungen und GLB-Clips werden nicht ersetzt. Die simulierten Einstellungen dienen nur der Vorschau.</p>
        {model.url?<p role="status">{footStatusV738}. V135-Kontaktphase vor/nach Animationsschritt; keine Messung sichtbarer Restbewegung.</p>:
          <p>Kein humanoides GLB ausgewählt: der Platzhalter besitzt weder Foot-IK noch Gesäßknochen/Morph-Targets.</p>}
        {rigInventoryV739?.url===model.url&&!rigInventoryV739.hips&&
          <p role="alert">⚠ Dieser Avatar besitzt keinen erkannten Hips-/Beckenknochen. Prozedurale Hüftbewegungen und der GLB-Export können nicht wie vorgesehen funktionieren.</p>}
        {rigInventoryV739?.url===model.url&&rigInventoryV739.hips&&!rigInventoryV739.feet&&
          <p role="status">Hinweis: Keine vollständigen Fußknochen gefunden. Die Hüftanimation kann laufen, aber die Foot-IK ist möglicherweise nicht verfügbar.</p>}
        {rigInventoryV739?.url===model.url&&rigInventoryV739.hips&&(!rigInventoryV739.upper||!rigInventoryV739.arms)&&
          <p role="status">V740 Rig-Hinweis: {(!rigInventoryV739.upper?'Brust-/Wirbelsäulenknochen ':'')+(!rigInventoryV739.arms?'Arm-/Schulterknochen':'')} fehlen. Entsprechende Gegenbewegungen entfallen.</p>}
        {model.url && rigInventoryV739?.url===model.url && <p role={preferences.avatarGluteRigV741?.enabled&&!rigInventoryV739.gluteReady?'alert':'status'}>
          V741 {rigInventoryV739.gluteReady?'Rig-Analyse':'⚠ Nicht unterstützt'}: {rigInventoryV739.gluteStatus}
        </p>}
        {model.url && !rigInventoryV739 && <p role="status">V741: Gesäßknochen und Morph-Targets werden beim Laden des Avatars geprüft.</p>}
        <small>V741: Gesäßverformung ist separat einstellbar und standardmäßig ausgeschaltet. Ohne passende GLB-Skin-Weights/Morph-Targets entsteht keine unabhängige Verformung. Die Warnung wird beim Avatarwechsel aktualisiert.</small>
        <small>V740 Natural Body Dynamics übernimmt die gespeicherten Stärke- und Arm-/Bein-Einstellungen aus Dance Studio. Stützfüße bleiben ohne zusätzlichen Fußwinkel.</small>
        <small>V738 verwendet dieselben Bewegungsprofile und Übergangszeiten wie die Bühne. Bei aktivierter Vorschau wird der ausgewählte GLB-Tanzclip vorübergehend pausiert.</small>
      </fieldset>
      {model.url && clipReadyV739 && clips.length === 0 && <p className="avatar-editor-help">Keine GLB-Clips gefunden. Die drei Hüftbewegungen sind nur prozedural verfügbar.</p>}
      {model.url&&<fieldset aria-label="GLB-Motion Export V739"><legend>GLB Motion Integration · V739</legend>
        <p>Erzeugt je einen wiederverwendbaren Animationsclip mit den Knochen dieses Avatars als GLB-Datei. Danach kannst du die Datei im Motion-Installer hinzufügen.</p>
        <label>GLB-Bewegung für Export
          <select value={exportSelectedV739} onChange={e=>setExportSelectedV739(e.target.value as HipGlbClipNameV739)}>
            {HIP_GLB_NAMES_V739.map(name=><option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <button type="button" disabled={exportBusyV739} onClick={()=>void exportMotionV739(exportSelectedV739)}>
          {exportBusyV739?'Erzeuge Animations-GLB …':'GLB mit gewähltem Clip exportieren'}
        </button>
        {exportStatusV739&&<p role="status">{exportStatusV739}</p>}
        <small>Export ist ein gebackener Bewegungsclip für genau dieses Rig. Kein automatischer Bibliotheksimport, keine separaten Gesäßknochen und keine garantierte Fußfixierung ohne Laufzeit-IK. Prüfe den importierten Clip in der 3D-Vorschau.</small>
      </fieldset>}
    </div>
  </section>;
}
