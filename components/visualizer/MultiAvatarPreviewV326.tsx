'use client';
import {Suspense,useEffect,useMemo,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,useGLTF} from '@react-three/drei';
import {AnimationMixer} from 'three';
import {clone as cloneScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import type {GroupPoseV326} from './multiAvatarStageDirectorV326';
import type {TrackAnalysisV318} from '@/services/musicAnalysis/trackAnalysisV318';
import {GROUP_SYNC_DEFAULT_V327,readGroupSyncV327,GROUP_SYNC_EVENT_V327,evaluateGroupSyncV327} from './groupDanceSynchronizationV327';
import {MOTION_SYNC_DEFAULT_V328,readMotionSyncV328,MOTION_SYNC_EVENT_V328,phaseForClipV328,type MotionSyncV328} from './groupMotionSynchronizationV328';
import {PHRASE_DEFAULT_V329,readPhraseV329,PHRASE_EVENT_V329,describeAnimationClipsV329,planGroupPhrasesV329,type PhraseSettingsV329,type PhraseSignatureV329,type PhraseMatchV329} from './intelligentMotionPhraseV329';
const colors=['#64def0','#bd8aff','#68e9ab','#ffcc7d'];
function ImportedFigure({url,seconds,index,sync,bpm,beatTimes,playing,phrase,plan,register}:{url:string;seconds:number;index:number;sync:MotionSyncV328;bpm:number;beatTimes?:readonly number[];playing:boolean;phrase:PhraseSettingsV329;plan:PhraseMatchV329;register:(slot:number,profiles:readonly PhraseSignatureV329[])=>void}){
 const {scene,animations}=useGLTF(url);
 const model=useMemo(()=>cloneScene(scene),[scene]);
 const mixer=useMemo(()=>new AnimationMixer(model),[model]);
 const signatures=useMemo(()=>phrase.enabled?describeAnimationClipsV329(animations,phrase.maxCandidates):[],[animations,phrase.enabled,phrase.maxCandidates]);
 useEffect(()=>{if(phrase.enabled)register(index,signatures);},[phrase.enabled,register,index,signatures]);
 const recommended=phrase.enabled && (!sync.enabled || sync.clipIndexes[index]<0) && plan.eligible[index]?plan.indices[index]:-1;
 const ix=Math.min(animations.length-1,Math.max(0,sync.enabled&&sync.clipIndexes[index]>=0?sync.clipIndexes[index]:recommended>=0?recommended:0));
 useEffect(()=>{if(animations[ix])mixer.clipAction(animations[ix]).reset().play();return()=>{mixer.stopAllAction();mixer.uncacheRoot(model);};},[animations,mixer,model,ix]);
 useFrame(()=>{const clip=animations[ix];if(!clip)return;
  const extra=phrase.enabled&&phrase.alignPhase&&(!sync.enabled||sync.clipIndexes[index]<0)?plan.offsets[index]??0:0;
  const phaseSync=extra?{...sync,phaseOffsets:sync.phaseOffsets.map((x,i)=>i===index?x+extra:x)}:sync;
  const phase=phaseForClipV328(phaseSync,{enabled:true,seconds,bpm,beatTimes,playing:true,slot:index,reducedMotion:false},clip.duration);
  mixer.setTime(phase?phase.time:seconds%Math.max(.1,clip.duration));
 });
 return <primitive object={model}/>;
}
function DemoFigure({color}:{color:string}){return <group>
 <mesh position={[0,1.05,0]}><capsuleGeometry args={[.23,.75,5,10]}/><meshStandardMaterial color={color}/></mesh>
 <mesh position={[0,1.85,0]}><sphereGeometry args={[.19,12,8]}/><meshStandardMaterial color="#f6d9ba"/></mesh>
 {[-1,1].map(v=><group key={v}><mesh position={[v*.16,.45,0]}><capsuleGeometry args={[.10,.62,4,8]}/><meshStandardMaterial color="#405069"/></mesh><mesh position={[v*.33,1.18,0]} rotation={[0,0,v*.33]}><capsuleGeometry args={[.075,.57,4,8]}/><meshStandardMaterial color={color}/></mesh></group>)}
 </group>;}
function Figure({index,point,seconds,url,focus,accent,sync,bpm,beatTimes,playing,phrase,plan,register}:{index:number;point:[number,number,number];seconds:number;url:string|null;focus:boolean;accent:number;sync:MotionSyncV328;bpm:number;beatTimes?:readonly number[];playing:boolean;phrase:PhraseSettingsV329;plan:PhraseMatchV329;register:(slot:number,profiles:readonly PhraseSignatureV329[])=>void}){
 return <group position={point} scale={focus?[1.04,1.04,1.04]:[1,1,1]}>
  <Suspense fallback={<DemoFigure color={colors[index]}/>}>{url?<ImportedFigure url={url} seconds={seconds} index={index} sync={sync} bpm={bpm} beatTimes={beatTimes} playing={playing} phrase={phrase} plan={plan} register={register}/>:<DemoFigure color={colors[index]}/>}</Suspense>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.008,0]} scale={[1+accent*.65,1+accent*.65,1]}><ringGeometry args={[.40,.46,40]}/><meshBasicMaterial color={colors[index]} transparent opacity={.18+accent*.62}/></mesh>
 </group>;
}
export function MultiAvatarPreviewV326({pose,seconds,urls,bpm=128,analysis=null,playing=false,songSync=false}:{pose:GroupPoseV326|null;seconds:number;urls:(string|null)[];bpm?:number;analysis?:TrackAnalysisV318|null;playing?:boolean;songSync?:boolean}){
 const [sync,setSync]=useState(GROUP_SYNC_DEFAULT_V327);
 const [motionSync,setMotionSync]=useState(MOTION_SYNC_DEFAULT_V328);
 const [phrase,setPhrase]=useState(PHRASE_DEFAULT_V329);
 const [profiles,setProfiles]=useState<readonly (readonly PhraseSignatureV329[])[]>([[],[],[],[]]);
 const register=useMemo(()=>((slot:number,candidates:readonly PhraseSignatureV329[])=>setProfiles(previous=>{
  const sig=(list:readonly PhraseSignatureV329[])=>list.map(v=>`${v.index}:${v.name}:${v.wave.join(',')}`).join('|');
  if(sig(previous[slot]??[])===sig(candidates))return previous;
  const next=[...previous];next[slot]=candidates;return next;
 })),[]);
 const phrasePlan=useMemo(()=>planGroupPhrasesV329(profiles,pose?.positions.length??4,phrase,motionSync.enabled?motionSync.clipIndexes:[],motionSync.beatCycle),[profiles,pose?.positions.length,phrase,motionSync.clipIndexes,motionSync.beatCycle]);
 useEffect(()=>{const refresh=()=>setPhrase(readPhraseV329());refresh();window.addEventListener(PHRASE_EVENT_V329,refresh);return()=>window.removeEventListener(PHRASE_EVENT_V329,refresh);},[]);
 useEffect(()=>{const refresh=()=>setMotionSync(readMotionSyncV328());refresh();window.addEventListener(MOTION_SYNC_EVENT_V328,refresh);return()=>window.removeEventListener(MOTION_SYNC_EVENT_V328,refresh);},[]);
 useEffect(()=>{const refresh=()=>setSync(readGroupSyncV327());refresh();window.addEventListener(GROUP_SYNC_EVENT_V327,refresh);return()=>window.removeEventListener(GROUP_SYNC_EVENT_V327,refresh);},[]);
 const music=evaluateGroupSyncV327(sync,{seconds,bpm:analysis?.tempo??bpm,count:pose?.positions.length===3?3:4,focus:pose?.focus??-1,drop:pose?.drop??false,playing,reducedMotion:false,
  beatTimes:analysis?.beats.map(b=>b.startMs/1000),beatsPerBar:analysis?.timeSignature});
 if(!pose)return <p>Keine Formations-Cues vorhanden.</p>;
 return <section aria-label="V326 Drei- und Vier-Tänzer-Vorschau"><div className="ensemble-studio-v325-preview">
  <Canvas camera={{position:[0,3.6,9.2],fov:45}} dpr={[1,1.3]}><ambientLight intensity={1.25}/><directionalLight position={[3,6,5]} intensity={1.6}/>
   <gridHelper args={[12,12,'#53657a','#2e3a54']} position={[0,-.02,0]}/>
   {pose.positions.map((point,i)=><Figure key={i} index={i} point={point} seconds={seconds} url={urls[i]??null} focus={pose.focus===i} accent={music.gains[i]*music.pulses[i]} sync={motionSync} bpm={analysis?.tempo??bpm} beatTimes={songSync?analysis?.beats.map(b=>b.startMs/1000):undefined} playing={playing} phrase={phrase} plan={phrasePlan} register={register}/>)}
   <OrbitControls enablePan={false} minDistance={4} maxDistance={17} target={[0,.9,0]}/>
  </Canvas></div><small>Synchroner Modell-Clip bei GLB-Dateien mit eingebetteter Animation; sonst Demo-Figur. Die Leuchtringe zeigen V327-Gruppenakzente; V328 synchronisiert ausgewählte eingebettete GLB-Clips optional nach gemeinsamer Beat-Phase. V329 empfiehlt bei aktivierter Clip-Analyse passende, bereits eingebettete Tanzclips auf Basis lokaler Keyframes; dies ist eine heuristische Bewegungsähnlichkeit. Weitere Live-Motion- und Beleuchtungseffekte werden hier nicht simuliert.</small>
  {phrase.enabled&&<div className="group-dance-sync-v327-meters" aria-label="V329 Vorschau der passenden Motion-Phrasen">
   {pose.positions.map((_,i)=><div key={i} className="group-dance-sync-v327-meter"><strong>Tänzer {i+1}</strong>: {phrasePlan.eligible[i]?`Clip ${phrasePlan.indices[i]} · ${(phrasePlan.scores[i]*100).toFixed(0)} % Übereinstimmung${phrase.alignPhase&&motionSync.enabled?` · +${phrasePlan.offsets[i].toFixed(2)} Beats`:''}`:'Manuelle Auswahl oder zu wenig passende Bewegungsdaten'}</div>)}
  </div>}
 </section>;
}
