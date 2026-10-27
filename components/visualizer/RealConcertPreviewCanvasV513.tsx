'use client';
/** An opt-in OFFLINE WebGL scene. It never mounts in the live visualizer Canvas. */
import {Component,Suspense,useCallback,useEffect,useMemo,useRef,useState,type ReactNode,type RefObject} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,Quaternion,Vector3,type AnimationClip} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {readRetargetCalibration,retargetHumanoidClips} from './avatarAnimationRetarget';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {findAnimatedBonesV508,sampleAnimatedGlbV508} from './measureAnimatedGlbV508';
import {measureGlbBodyV507} from './measureGlbBodyV507';
import {previewReportV513,previewSampleRateV513,previewStageV513,type PreviewTierV513,type PreviewPiV513} from './realConcertQualityV513';
import type {MotionCapsuleV508,MotionSampleV508} from './animatedCollisionV508';
import {sampleMotionPoseV514} from './sampleMotionQualityV514';
import {inspectMotionPoseV514,recordQualityEventsV514,type MotionPoseV514,type QualityEventV514} from './motionQualityInspectorV514';
import {correctionAdviceV515} from './intelligentMotionCorrectionV515';
import type {VisualFrameV512} from './visualConcertQualityV512';
import type {AvatarModel} from './avatarModels';
const palette=['#64def0','#b896f9','#81dcb5','#f9c66c'];
function SampleCapsuleV513({segment,danger}:{segment:MotionCapsuleV508;danger:boolean}){
 const a=useMemo(()=>new Vector3(...segment.a),[segment.a]);
 const b=useMemo(()=>new Vector3(...segment.b),[segment.b]);
 const middle=useMemo(()=>a.clone().add(b).multiplyScalar(.5),[a,b]);
 const direction=useMemo(()=>b.clone().sub(a),[a,b]);
 const rotation=useMemo(()=>new Quaternion().setFromUnitVectors(new Vector3(0,1,0),direction.clone().normalize()),[direction]);
 return <mesh position={middle} quaternion={rotation} scale={[segment.radius,Math.max(.04,direction.length()),segment.radius]}>
  <cylinderGeometry args={[1,1,1,7]}/>
  <meshBasicMaterial color={danger?'#ff6f67':segment.part==='torso'?'#f9d87c':'#6bd7ff'} transparent opacity={.38} depthWrite={false}/>
 </mesh>;
}
function DummyV513({index}:{index:number}){
 return <group><mesh position={[0,1.15,0]}><capsuleGeometry args={[.25,.75,5,9]}/><meshStandardMaterial color={palette[index]}/></mesh>
 <mesh position={[0,1.96,0]}><sphereGeometry args={[.21,12,10]}/><meshStandardMaterial color="#f5d9c4"/></mesh>
 {[-1,1].map(s=><group key={s}><mesh position={[s*.42,1.31,0]} rotation={[0,0,s*.4]}><capsuleGeometry args={[.08,.5,5,8]}/><meshStandardMaterial color={palette[index]}/></mesh><mesh position={[s*.13,.48,0]}><capsuleGeometry args={[.1,.6,5,8]}/><meshStandardMaterial color="#42516b"/></mesh></group>)}
 </group>;
}
class RigLoadBoundaryV513 extends Component<{children:ReactNode;index:number},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<DummyV513 index={this.props.index}/>:this.props.children;}
}
function RigV513({index,url,motionUrl,clock,tier,pi,count,onSample,qualityEnabled,onQualityPose}:{index:number;url:string;motionUrl:string|null;clock:RefObject<{seconds:number;playing:boolean}>;tier:PreviewTierV513;pi:PreviewPiV513;count:number;onSample:(slot:number,sample:MotionSampleV508|undefined)=>void;qualityEnabled:boolean;onQualityPose:(slot:number,pose:MotionPoseV514|undefined)=>void}){
 const {scene,animations}=useGLTF(url);
 const clone=useMemo(()=>{
  const copy=cloneSkinnedScene(scene);
  const box=new Box3().setFromObject(copy);
  const height=box.max.y-box.min.y;
  if(Number.isFinite(height)&&height>.001){
   const k=Math.min(4,Math.max(.015,2.05/height));
   const center=box.getCenter(new Vector3());
   copy.scale.multiplyScalar(k);copy.position.set(-center.x*k,-box.min.y*k,-center.z*k);
  }
  return copy;
 },[scene]);
 const mixer=useMemo(()=>new AnimationMixer(clone),[clone]);
 const bones=useMemo(()=>findAnimatedBonesV508(clone),[clone]);
 const profile=useMemo(()=>measureGlbBodyV507(clone,1),[clone]);
 const sampledAt=useRef(-Infinity);
 const [externalClip,setExternalClip]=useState<AnimationClip|null>(null);
 useEffect(()=>{
  let cancelled=false;setExternalClip(null);
  if(!motionUrl)return;
  new GLTFLoader().loadAsync(motionUrl).then(gltf=>{
   if(cancelled)return;
   const result=retargetHumanoidClips(gltf.animations,gltf.scene,clone,readRetargetCalibration(url));
   if(!cancelled)setExternalClip(result.clips.find(c=>c.tracks.length>0)??null);
  }).catch(()=>{if(!cancelled)setExternalClip(null);});
  return ()=>{cancelled=true;};
 },[motionUrl,clone,url]);
 useEffect(()=>{
  const clip=(motionUrl?externalClip:null)??animations.find(a=>a.duration>0&&a.tracks.length>0);
  if(clip)mixer.clipAction(clip).reset().play();
  return ()=>{mixer.stopAllAction();mixer.uncacheRoot(clone);onSample(index,undefined);};
 },[animations,mixer,clone,index,onSample,motionUrl,externalClip]);
 useEffect(()=>{sampledAt.current=-Infinity;onSample(index,undefined);},[tier,pi,index,onSample,url]);
 useFrame(()=>{
  const current=clock.current.seconds;
  // Deterministic seek, including pause and multi-actor replay. Never alters live mixer.
  mixer.setTime(Math.max(0,current));
  const rate=previewSampleRateV513(tier,pi,count);
  if(!rate)return;
  if(current>=sampledAt.current&&current-sampledAt.current<1/rate)return;
  sampledAt.current=current;
  clone.updateWorldMatrix(true,true);
  onSample(index,sampleAnimatedGlbV508(bones,profile,current));
  if(qualityEnabled)onQualityPose(index,sampleMotionPoseV514(bones,current,0));
 });
 return <primitive object={clone} dispose={null}/>;
}
function PreviewClockV513({clock,playing,onTick}:{clock:RefObject<{seconds:number;playing:boolean}>;playing:boolean;onTick:(seconds:number)=>void}){
 const last=useRef(-Infinity);
 useFrame((_,delta)=>{
  clock.current.playing=playing;
  if(playing)clock.current.seconds+=Math.min(.1,Math.max(0,delta));
  if(clock.current.seconds-last.current>=.5||clock.current.seconds<last.current){last.current=clock.current.seconds;onTick(clock.current.seconds);}
 });
 return null;
}
export function RealConcertPreviewCanvasV513({frame,models,motions,playing,cursor,tier,pi,showCapsules,onTick,qualityEnabled,onSeek}:{
 frame:VisualFrameV512;models:readonly (AvatarModel|null)[];motions:readonly (string|null)[];playing:boolean;cursor:number;
 tier:PreviewTierV513;pi:PreviewPiV513;showCapsules:boolean;onTick:(seconds:number)=>void;qualityEnabled:boolean;onSeek:(seconds:number)=>void;
}){
 const stage=useMemo(()=>previewStageV513(frame),[frame]);
 const clock=useRef({seconds:cursor,playing});
 useEffect(()=>{clock.current.seconds=cursor;},[cursor]);
 const [samples,setSamples]=useState<readonly (MotionSampleV508|undefined)[]>([]);
 const onSample=useCallback((slot:number,sample:MotionSampleV508|undefined)=>{
  setSamples(previous=>{
   if(previous[slot]===sample)return previous;
   const next=[...previous];next[slot]=sample;return next;
  });
 },[]);
 useEffect(()=>{setSamples([]);},[models,motions,tier,pi,frame]);
 const previousPose=useRef<(MotionPoseV514|undefined)[]>([]);
 const [qualityEvents,setQualityEvents]=useState<QualityEventV514[]>([]);
 const [qualityCoverage,setQualityCoverage]=useState<boolean[]>([]);
 const onQualityPose=useCallback((slot:number,pose:MotionPoseV514|undefined)=>{
  if(!qualityEnabled||!pose)return;
  const last=previousPose.current[slot];
  const report=inspectMotionPoseV514(slot,pose,last);
  previousPose.current[slot]=pose;
  if(qualityCoverage[slot]!==report.available){
   setQualityCoverage(older=>{if(older[slot]===report.available)return older;const next=[...older];next[slot]=report.available;return next;});
  }
  if(report.events.length)setQualityEvents(older=>recordQualityEventsV514(older,report.events));
 },[qualityEnabled,qualityCoverage]);
 useEffect(()=>{previousPose.current=[];setQualityEvents([]);setQualityCoverage([]);},[models,motions,tier,pi,qualityEnabled,stage.points.length]);
 const actualSamples=useMemo(()=>stage.points.map((_,i)=>samples[i]),[samples,stage.points]);
 const qualityObserved=qualityCoverage.slice(0,stage.points.length).filter(Boolean).length;
 const labels:{[K in QualityEventV514['kind']]:string}={'joint-angle':'Gelenkwinkel','motion-jump':'Bewegungssprung','foot-slide':'Fußbewegung','body-lean':'Oberkörperhaltung'};
 const report=previewReportV513(actualSamples,stage.points.length,clock.current.seconds,tier);
 return <section className="v513-preview-shell" aria-label="Echte GLB-3D-Qualitätsvorschau">
  <div className="v513-canvas-wrap" style={{height:340,maxWidth:'100%',borderRadius:12,overflow:'hidden',background:'#0b1324'}}>
   <Canvas camera={{position:[0,3.7,9.8],fov:44,near:.1,far:80}} dpr={[1,1.25]} gl={{powerPreference:'low-power',antialias:false}}>
    <color attach="background" args={['#0b1324']}/><ambientLight intensity={1.35}/><directionalLight position={[2,6,6]} intensity={1.75}/>
    <gridHelper args={[10,10,'#476078','#29334d']} position={[0,-.01,0]}/>
    <PreviewClockV513 clock={clock} playing={playing} onTick={onTick}/>
    {stage.points.map((position,i)=><group key={`${i}:${models[i]?.id??'demo'}:${motions[i]??'embedded'}`} position={[position[0],position[1],position[2]]}>
     {models[i]?.url?<RigLoadBoundaryV513 index={i} key={models[i]!.url}><Suspense fallback={<DummyV513 index={i}/>}>
      <RigV513 url={models[i]!.url!} index={i} count={stage.points.length} clock={clock} tier={tier} pi={pi} motionUrl={motions[i]??null} onSample={onSample} qualityEnabled={qualityEnabled} onQualityPose={onQualityPose}/>
     </Suspense></RigLoadBoundaryV513>:<DummyV513 index={i}/>}
     <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}><ringGeometry args={[.38,.45,24]}/><meshBasicMaterial color={palette[i]}/></mesh>
    </group>)}
    {showCapsules&&tier!=='low'&&actualSamples.map((s,i)=>s?.capsules.map((c,j)=><SampleCapsuleV513 key={`${i}:${j}`} segment={c} danger={(report.risks[i]??0)>=.5}/>)??null)}
    {qualityEnabled&&qualityEvents.filter(e=>Math.abs(e.at-clock.current.seconds)<=.35).slice(-8).map((e,i)=><mesh key={`quality-${e.slot}-${e.kind}-${i}`} position={[e.location[0],e.location[1],e.location[2]]}>
      <sphereGeometry args={[.10,10,8]}/><meshBasicMaterial color={e.severity>.65?'#ff5f65':'#ffc95e'} wireframe depthTest={false}/>
     </mesh>)}
    <OrbitControls enablePan={false} minDistance={3} maxDistance={18} target={[0,1.1,0]}/>
   </Canvas>
  </div>
  <p role="status" className="settings-note"><strong>Unabhängige 3D-Vorschau:</strong> {report.status==='unavailable'?'Keine prüfbaren GLB-Kapselpaare.':`${report.checkedPairs}/${report.possiblePairs} Kapselpaare geprüft · ${report.nearPairs} nahe Paare · höchstes Risiko ${Math.round(report.maxRisk*100)} %.`} {report.status==='partial'?'Restliche Paare sind nicht geprüft.':''}</p>
  <section className="v514-motion-quality" aria-label="V514 Smart Concert Motion Quality Inspector">
   <h5>V514 · Bewegungsqualität / V515 Korrekturhinweise</h5>
   {!qualityEnabled?<p className="settings-note">Qualitätsprüfung deaktiviert (keine zusätzlichen Knochenauswertungen).</p>:
    tier==='low'?<p className="settings-note">Grafikstufe Low: Knochenabtastung deaktiviert, daher keine Qualitätsaussage möglich.</p>:
    <><p role="status" className="settings-note">{qualityObserved}/{stage.points.length} Avatare mit auswertbaren Qualitätsmerkmalen. {qualityObserved<stage.points.length?'Nicht geprüfte Avatare gelten nicht als fehlerfrei.':''} {qualityEvents.length} Auffälligkeiten im aktuellen Vorschauverlauf (max. 80).</p>
    {qualityEvents.length?<div className="v514-event-timeline" style={{maxHeight:190,overflowY:'auto'}}>
     {qualityEvents.slice().reverse().slice(0,32).map((e,i)=><button type="button" key={`${e.slot}-${e.kind}-${e.at}-${i}`} onClick={()=>onSeek(e.at)} style={{display:'block',width:'100%',textAlign:'left',margin:'4px 0',padding:7,border:'1px solid #53647f',borderRadius:7}} title="Vorschau pausieren und zu dieser Motion-Zeit springen">
      <strong>{e.at.toFixed(2)} s · Tänzer {e.slot+1} · {labels[e.kind]}</strong> · {e.label} · Stärke {Math.round(e.severity*100)} %
      {(()=>{const advice=correctionAdviceV515(e);return advice?<span style={{display:'block',fontSize:12,opacity:.86}}>V515: {advice.action} · {advice.explanation} (nur Hinweis)</span>:null;})()}
     </button>)}
    </div>:<p className="settings-note">Noch keine Auffälligkeiten aufgezeichnet. Starte die GLB-Animation oder gehe durch die Zeitleiste.</p>}
    </>}
   <p className="settings-note">Heuristische Hinweise aus den <strong>separaten Vorschau-GLB-Motions</strong>; kein klinischer Gelenkwinkeltest und kein garantierter Fußkontakt. Starke Tanzposen können absichtlich sein. V515 schlägt sichere Prüfmaßnahmen vor; vorhandene GLB-Clips werden nicht verändert. Die Timeline speichert keine Dateien und verändert keine Animationen.</p>
  </section>
  <p className="settings-note">{stage.rescaled?'Bühnenabstände wurden proportional verkleinert, damit alle Tänzer sichtbar bleiben. ':''}GLB-Clips laufen hier unabhängig von der Live-Show. Bunte Kapseln markieren vereinfachte Körpersegmente der <strong>Vorschau-Animation</strong>, keine exakten Skinned-Mesh-Kollisionen. Bei fehlenden Knochen wird kein sicheres Ergebnis behauptet.</p>
 </section>;
}
