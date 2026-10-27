'use client';
/** V591 genuine-GLB concert review fixture: independent of Spotify's production stage. */
import {Suspense,useCallback,useEffect,useMemo,useRef,useState,type MutableRefObject} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,Vector3,Group,LoopOnce,type AnimationClip} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {V591_DEMO_CUES,validV591Cues,parseV591Actors,safeV591AssetPath,compositionV591,
 type V591Actor,type V591Cue} from './concertQualityProtocolV591';
import type {V590Bounds} from './realConcertBenchmarkV590';

type ActorStatus={ready:boolean;name:string;duration:number;meshes:number;appliedGeneration:number;bounds:V590Bounds};
type Snapshot={ready:boolean;error:string|null;generation:number;appliedGeneration:number;cueIndex:number;
 cue:V591Cue|null;actors:ActorStatus[];webglVersion:string|null;drawCalls:number;triangles:number;
 scripted:boolean;scene:'multi-glb-review-fixture';};
type Config={actors:V591Actor[];cues:V591Cue[];scripted:boolean;error:string};
type Api={state:()=>Snapshot;seekCue:(cueIndex:number)=>boolean};
declare global {interface Window{__sonicV591?:Api;}}
const start=(cue:V591Cue|null=null):Snapshot=>({ready:false,error:null,generation:0,appliedGeneration:-1,cueIndex:0,cue,
 actors:[],webglVersion:null,drawCalls:0,triangles:0,scripted:false,scene:'multi-glb-review-fixture'});
function ConcertRig({actor,index,count,cue,generation,snapshot,onActorReady}:{actor:V591Actor;index:number;count:number;
 cue:V591Cue;generation:number;snapshot:MutableRefObject<Snapshot>;onActorReady:()=>void}){
 const source=useGLTF(actor.model);
 const gltf=useMemo(()=>cloneSkinnedScene(source.scene),[source.scene]);
 const validClips=useMemo<AnimationClip[]>(()=>source.animations.filter(x=>x.tracks.length&&Number.isFinite(x.duration)&&x.duration>0),[source.animations]);
 const mixer=useMemo(()=>new AnimationMixer(gltf),[gltf]);
 const ref=useRef<Group>(null),done=useRef(-1);
 const {gl,camera}=useThree();
 const setup=useMemo(()=>{
  const box=new Box3().setFromObject(gltf),center=new Vector3();box.getCenter(center);
  const h=Math.max(.001,box.getSize(new Vector3()).y),scale=Math.min(100,Math.max(.001,2.45/h));
  let meshes=0;gltf.traverse(node=>{if((node as any).isMesh)meshes++;});
  return {scale,offset:[-center.x*scale,1.45-center.y*scale,-center.z*scale] as [number,number,number],meshes};
 },[gltf]);
 useEffect(()=>{
  const clip=validClips[actor.clip];
  if(!clip||setup.meshes<1){snapshot.current.error=`Avatar ${index+1}: kein sichtbares GLB-Mesh oder inkompatibler Animationsclip ${actor.clip}`;onActorReady();return;}
  snapshot.current.actors[index]={ready:true,name:clip.name||`Clip ${actor.clip}`,duration:clip.duration,meshes:setup.meshes,appliedGeneration:-1,bounds:null};
  snapshot.current.webglVersion=gl.capabilities.isWebGL2?'WebGL2':'WebGL1';onActorReady();
  return ()=>{mixer.stopAllAction();mixer.uncacheRoot(gltf);};
 },[validClips,actor.clip,setup.meshes,index,mixer,gltf,snapshot,onActorReady,gl]);
 useEffect(()=>{
  const clip=validClips[actor.clip];done.current=-1;
  if(!clip||clip.duration<=0)return;
  mixer.stopAllAction();const action=mixer.clipAction(clip);
  action.reset();action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
  // Loop only within this genuine GLB clip, while the storyboard seeks by actual song-time.
  const sampled=cue.at%clip.duration;
  mixer.setTime(Math.min(sampled,Math.max(0,clip.duration-.00001)));
 },[validClips,mixer,actor.clip,cue]);
 useFrame(()=>{
  if(!ref.current||done.current===generation)return;
  const box=new Box3().setFromObject(ref.current,true);if(box.isEmpty())return;
  const mn=box.min,mx=box.max,pt=new Vector3();let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(let i=0;i<8;i++){
   pt.set(i&1?mx.x:mn.x,i&2?mx.y:mn.y,i&4?mx.z:mn.z).project(camera);
   if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y))return;
   minX=Math.min(minX,pt.x);maxX=Math.max(maxX,pt.x);minY=Math.min(minY,pt.y);maxY=Math.max(maxY,pt.y);
  }
  const status=snapshot.current.actors[index];if(!status)return;
  status.bounds={minX,maxX,minY,maxY};status.appliedGeneration=generation;
  snapshot.current.drawCalls=gl.info.render.calls;snapshot.current.triangles=gl.info.render.triangles;
  done.current=generation;
  if(snapshot.current.actors.length===count&&snapshot.current.actors.every(a=>a?.ready&&a.appliedGeneration===generation)){
   snapshot.current.appliedGeneration=generation;
  }
 });
 return <group position={[(index-(count-1)/2)*2.1,0,0]}><group ref={ref} position={setup.offset} scale={setup.scale}><primitive object={gltf}/></group></group>;
}
function CameraCue({cue,count}:{cue:V591Cue;count:number}){
 const {camera}=useThree();
 useEffect(()=>{
  const leadX=(cue.focus-(count-1)/2)*2.1;
  const x=cue.camera==='lead'?leadX*.7:cue.camera==='duet'?leadX*.35:0;
  const z=cue.camera==='lead'?7.6:cue.camera==='duet'?9.1:count===4?12.4:10.6;
  camera.position.set(x,1.65,z);camera.lookAt(cue.camera==='lead'?leadX*.56:0,1.35,0);
  camera.updateProjectionMatrix();
 },[camera,cue,count]);
 return null;
}
function StageSet({cue,count}:{cue:V591Cue;count:number}){
 const hook=cue.fx==='hook',led=cue.fx==='led'||hook,gobo=cue.fx==='gobo'||hook;
 return <group>
  <color attach="background" args={[hook?'#18103b':'#09172a']}/>
  <ambientLight intensity={.85}/><directionalLight position={[4,5,4]} intensity={hook?2.0:1.4}/>
  <pointLight position={[-3,3,2]} color="#39bde9" intensity={led?2.1:.65}/>
  <pointLight position={[3,3,2]} color="#c466ea" intensity={hook?2:.7}/>
  <mesh position={[0,-.05,-3.0]}><planeGeometry args={[12,5.6]}/><meshBasicMaterial color={led?'#162f55':'#152038'}/></mesh>
  {Array.from({length:22},(_,i)=><mesh key={i} position={[(i%11-5)*.95,1.25-Math.floor(i/11)*.7,-2.94]}>
    <planeGeometry args={[.27,.3]}/><meshBasicMaterial color={led?(i%3===0?'#80d4f7':'#5463bd'):'#223653'} transparent opacity={led?.7:.23}/>
   </mesh>)}
  <mesh position={[0,-.07,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[12,7]}/><meshStandardMaterial color="#14243c" roughness={.76}/></mesh>
  {gobo&&Array.from({length:4},(_,i)=><mesh key={i} position={[(i-1.5)*2.4,-.055,.9]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.45,.85,16]}/><meshBasicMaterial color={hook?'#964dce':'#376ea4'} transparent opacity={.28} depthWrite={false}/></mesh>)}
  <gridHelper args={[12,12,'#243d5a','#172b47']} position={[0,-.052,0]}/>
 </group>;
}
function Scene({config,selection,snapshot,onActorReady}:{config:Config;selection:{cueIndex:number;generation:number};
 snapshot:MutableRefObject<Snapshot>;onActorReady:()=>void}){
 const cue=config.cues[selection.cueIndex];
 return <Canvas frameloop="always" dpr={1} gl={{antialias:true,preserveDrawingBuffer:true}}
   camera={{position:[0,1.65,11],fov:40,near:.1,far:100}}>
  <CameraCue cue={cue} count={config.actors.length}/><StageSet cue={cue} count={config.actors.length}/>
  <Suspense fallback={null}>{config.actors.map((actor,i)=><ConcertRig key={`${i}-${actor.model}-${actor.clip}`}
   actor={actor} index={i} count={config.actors.length} cue={cue} generation={selection.generation}
   snapshot={snapshot} onActorReady={onActorReady}/>)}</Suspense>
 </Canvas>;
}
export function V591ConcertBrowserStage(){
 const [config,setConfig]=useState<Config|null>(null),[selection,setSelection]=useState({cueIndex:0,generation:0});
 const [readyToken,setReadyToken]=useState(0),snapshot=useRef<Snapshot>(start());
 useEffect(()=>{
  let closed=false;const query=new URLSearchParams(window.location.search),actors=parseV591Actors(query.get('models')||'',query.get('clips')||'');
  const script=query.get('script');const error=!actors?'Zwei bis vier gültige lokale GLB-Modelle und passende Clip-Indizes erforderlich.':
   script&&!safeV591AssetPath(script,'.json')?'Cue-Datei muss ein sicherer lokaler JSON-Pfad sein.':'';
  snapshot.current=start();if(error){snapshot.current.error=error;setConfig({actors:[],cues:[],scripted:false,error});return;}
  if(!script){setConfig({actors:actors!,cues:[...V591_DEMO_CUES],scripted:false,error:''});return;}
  (async()=>{try{
   const response=await fetch(script,{credentials:'same-origin'});if(!response.ok)throw Error(`Cue-Datei HTTP ${response.status}`);
   const raw=await response.text();if(raw.length>16000)throw Error('Cue-Datei ist zu groß.');
   const cues:unknown=JSON.parse(raw);if(!validV591Cues(cues,actors!.length))throw Error('Ungültige Cue-Definitionen.');
   if(!closed)setConfig({actors:actors!,cues,scripted:true,error:''});
  }catch(e){if(!closed){const message=`Cue-Datei: ${String(e)}`;snapshot.current.error=message;setConfig({actors:[],cues:[],scripted:false,error:message});}}})();
  return ()=>{closed=true;};
 },[]);
 const onActorReady=useCallback(()=>setReadyToken(v=>v+1),[]);
 const ready=!!config&&!config.error&&snapshot.current.actors.length===config.actors.length&&
  snapshot.current.actors.every(a=>a?.ready)&&!snapshot.current.error;
 useEffect(()=>{
  if(!ready||!config)return;
  snapshot.current.ready=true;snapshot.current.cue=config.cues[selection.cueIndex];snapshot.current.cueIndex=selection.cueIndex;
  snapshot.current.scripted=config.scripted;
  const api:Api={state:()=>({...snapshot.current,actors:snapshot.current.actors.map(a=>({...a,bounds:a.bounds?{...a.bounds}:null})),
    cue:snapshot.current.cue?{...snapshot.current.cue}:null}),
   seekCue:(index)=>{
    if(!Number.isInteger(index)||index<0||index>=config.cues.length)return false;
    snapshot.current.generation+=1;snapshot.current.appliedGeneration=-1;
    snapshot.current.cueIndex=index;snapshot.current.cue=config.cues[index];
    setSelection({cueIndex:index,generation:snapshot.current.generation});return true;
   }};
  window.__sonicV591=api;return ()=>{if(window.__sonicV591===api)delete window.__sonicV591;};
 },[ready,readyToken,selection.cueIndex,config]);
 const cue=config?.cues[selection.cueIndex];
 const review=compositionV591(snapshot.current.actors.map(a=>a?.bounds||null),!!cue?.line);
 return <main style={{background:'#080f1c',color:'#ebf5ff',minHeight:'100vh',padding:14,fontFamily:'system-ui,sans-serif'}}>
  <h1 style={{fontSize:20,margin:'0 0 8px'}}>V591 · Concert Visual Quality · Multi-GLB Review</h1>
  <p style={{fontSize:12}}>Eigenständige Review-Szene mit echten GLBs, nicht die Spotify-Live-Show. {config?.scripted?'Eigene Cue-Datei geladen.':'Demo-Cues und Demo-Text, keine echten Lyrics.'}</p>
  {config?.error&&<p role="alert">{config.error}</p>}
  {config&&!config.error&&<div data-v591-stage="full-concert" style={{position:'relative',width:960,maxWidth:'100%',aspectRatio:'16 / 9',overflow:'hidden',border:'1px solid #456485',background:'#09172a'}}>
   <Scene config={config} selection={selection} snapshot={snapshot} onActorReady={onActorReady}/>
   <div data-v591-lyrics="true" style={{position:'absolute',bottom:0,left:'8%',width:'84%',height:'27%',pointerEvents:'none',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'linear-gradient(transparent,rgba(3,9,20,.85))'}}>
    <span style={{fontSize:12,letterSpacing:2,color:'#9cbedb',fontWeight:600}}>{cue?.fx==='hook'?'HOOK':`PERFORMER ${(cue?.focus??0)+1}`}</span>
    <strong style={{fontSize:'clamp(15px,2.4vw,27px)',textAlign:'center',lineHeight:1.3,textShadow:'0 2px 9px #000'}}>{cue?.line}</strong>
   </div>
   <div style={{position:'absolute',top:8,right:8,fontSize:10,padding:5,background:'#06101acb'}}>V591 · {cue?.camera} · {cue?.fx}</div>
  </div>}
  <p role="status" data-v591-status={config?.error||snapshot.current.error?'blocked':ready?'ready':'loading'}>
   {config?.error||snapshot.current.error||(ready?`${config?.actors.length} echte GLB-Avatare · ${config?.cues.length} Cues · ${review.status}`:'GLBs werden geladen. Ohne gültige Animationen keine Messung.')}
  </p>
  {ready&&config&&<label>Storyboard-Cue <select data-v591-cue-picker value={selection.cueIndex} onChange={e=>window.__sonicV591?.seekCue(Number(e.target.value))}>
   {config.cues.map((c,i)=><option key={c.id} value={i}>{c.id} · {c.at}s · {c.camera}</option>)}
  </select></label>}
  <p style={{fontSize:11}}>Sichtprüfung: Frame-Pacing und projizierte Grenzen sind nur technische Hinweise. Natürliches Tanzen und Lip-Sync müssen am echten Gerät beurteilt werden.</p>
 </main>;
}
