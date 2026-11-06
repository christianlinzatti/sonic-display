'use client';
import {useOwnedAvatarResourcesV1009} from './useOwnedAvatarResourcesV1009';
/** V787 diagnostic: all three *rig-validated* GLBs are kept loaded. Cross-tier
 * dance uses one monotonically advancing mixer time, never remount-on-tier.
 * Not used by live stage; do not interpret three preloaded assets as a GPU benchmark. */
import {Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {AnimationMixer,type Mesh} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
import {ModelPreviewBoundaryV733} from './ModelPreviewBoundaryV733';
import {selectSmartAvatarLodV787,triangleSavingsV787,type LodV787,type LodStateV787} from '@/services/monitoring/smartAvatarLodV787';

type Variant={name:LodV787;status:string;sha256:string;url:string;triangles:number;skinJoints:number;clips:number;mouthMorphs:string[]};
type LodReport={format:string;version:number;status:string;variants:Variant[];issues:string[];notes:string[]};
const roles:readonly LodV787[]=['LOD0','LOD1','LOD2'];
function valid(value:unknown):value is LodReport{
 const v=value as Partial<LodReport>;
 return !!v&&v.format==='sonic-smart-avatar-lod-v787'&&v.version===1&&['ready','blocked'].includes(v.status??'')&&
 Array.isArray(v.variants)&&v.variants.length===3&&roles.every((r,i)=>v.variants![i]?.name===r)&&
 v.variants.every(p=>['compatible','missing','incompatible','invalid'].includes(p.status)&&
 (p.status!=='compatible'||(/^[a-f0-9]{64}$/.test(p.sha256)&&typeof p.url==='string'&&Number.isSafeInteger(p.triangles)&&p.triangles>=0)))&&
 Array.isArray(v.issues)&&Array.isArray(v.notes);
}
function sameOriginGlb(url:string):boolean{
 if(!/^\/[a-zA-Z0-9_/% .-]+\.glb$/i.test(url)||url.includes('..')||url.includes('//'))return false;
 try{const u=new URL(url,window.location.origin);return u.origin===window.location.origin&&u.pathname.startsWith('/')&&u.pathname.toLowerCase().endsWith('.glb')}catch{return false;}
}
function Performer({url,visible}:{url:string;visible:boolean}){
 const {scene,animations}=useGLTF(url);
 const clone=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  useOwnedAvatarResourcesV1009(clone);
 const mixer=useMemo(()=>new AnimationMixer(clone),[clone]);
 const mouth=useMemo(()=>{const targets:Array<{mesh:Mesh;idx:number}>=[];clone.traverse(o=>{const m=o as Mesh;
  if(!m.isMesh||!m.morphTargetDictionary||!m.morphTargetInfluences)return;
  for(const [name,idx] of Object.entries(m.morphTargetDictionary))if(/mouth|jaw|open|viseme/i.test(name)){targets.push({mesh:m,idx});break;}
 });return targets;},[clone]);
 useEffect(()=>{if(animations.length)mixer.clipAction(animations[0]).reset().play();return()=>{mixer.stopAllAction();mixer.uncacheRoot(clone);};},[mixer,clone,animations]);
 useEffect(()=>()=>{disposeClonedAvatarSkeletonsV654(clone)},[clone]);
 useFrame(({clock})=>{
  if(!visible)return; // hidden rigs retain their cached state until displayed
  const logicalTime=clock.elapsedTime;
  if(animations.length)mixer.setTime(logicalTime); // same concert time on every switch
  const vocal=.18+.37*(1+Math.sin(logicalTime*17))*.5;
  for(const {mesh,idx} of mouth)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[idx]=vocal;
 });
 return <group visible={visible} position={[0,-.85,0]}><primitive object={clone}/></group>;
}
function LodWorld({urls,distance,onActive}:{urls:Record<LodV787,string>;distance:number;onActive:(tier:LodV787,reason:string)=>void}){
 const {camera}=useThree(),[tier,setTier]=useState<LodV787>('LOD0');
 const hold=useRef<LodStateV787>({tier:'LOD0',lastSwitchMs:Number.NEGATIVE_INFINITY});
 const clockRef=useRef<number|null>(null);
 useFrame(({clock},delta)=>{
  camera.position.set(0,1.15,distance);camera.lookAt(0,.20,0);camera.updateMatrixWorld();
  if(clockRef.current===null)clockRef.current=clock.elapsedTime;
  const now=(clock.elapsedTime-clockRef.current)*1000;
  const next=selectSmartAvatarLodV787(distance,now,{LOD0:true,LOD1:true,LOD2:true},hold.current);
  if(next.changed){hold.current={tier:next.tier,lastSwitchMs:now};setTier(next.tier);onActive(next.tier,next.reason);}
 });
 return <>
  <ambientLight intensity={.9}/><directionalLight position={[3,5,4]} intensity={2}/><directionalLight position={[-2,1,-3]} intensity={.6} color="#89ccff"/>
  <gridHelper args={[12,12,0x466078,0x253448]} position={[0,-.85,0]}/>
  {roles.map(l=><Performer key={urls[l]} url={urls[l]} visible={l===tier}/>)}
 </>;
}
function Preview({urls,distance,onActive}:{urls:Record<LodV787,string>;distance:number;onActive:(l:LodV787,r:string)=>void}){
 const [retry,setRetry]=useState(0);
 return <ModelPreviewBoundaryV733 key={retry} onRetry={()=>{setRetry(x=>x+1)}}>
  <div style={{height:440,width:'100%',background:'#080f1e',borderRadius:12,overflow:'hidden'}}>
   <Canvas camera={{position:[0,1.15,4],fov:43}} dpr={[1,1.5]} gl={{powerPreference:'high-performance'}}>
    <Suspense fallback={null}><LodWorld urls={urls} distance={distance} onActive={onActive}/></Suspense>
   </Canvas>
  </div>
 </ModelPreviewBoundaryV733>;
}
export function SmartAvatarLodDirectorV787(){
 const [report,setReport]=useState<LodReport|null>(null),[error,setError]=useState(''),[validated,setValidated]=useState(false);
 const [distance,setDistance]=useState(3),[active,setActive]=useState<LodV787>('LOD0'),[reason,setReason]=useState('Nahaufnahme: LOD0');
 const [loading,setLoading]=useState(false);
 async function load(file:File|undefined){setError('');setReport(null);setValidated(false);if(!file)return;
  if(file.size>1024*1024){setError('JSON zu gross (max. 1 MB)');return;}
  try{const value:unknown=JSON.parse(await file.text());if(!valid(value))throw Error('Kein V787-LOD-Pruefbericht');setReport(value)}catch(e){setError(String(e))}
 }
 useEffect(()=>{if(!report||report.status!=='ready')return;
  let cancelled=false;const abort=new AbortController();setLoading(true);setValidated(false);
  void (async()=>{for(const v of report.variants){
    if(!sameOriginGlb(v.url))throw Error(`${v.name}: kein sicherer lokaler GLB-Pfad`);
    const response=await fetch(v.url,{signal:abort.signal,cache:'no-store'});
    if(!response.ok)throw Error(`${v.name}: GLB nicht gefunden (HTTP ${response.status})`);
    if(Number(response.headers.get('content-length')||0)>64*1024*1024)throw Error(`${v.name}: GLB zu gross`);
    const bytes=await response.arrayBuffer();if(bytes.byteLength>64*1024*1024||bytes.byteLength<20)throw Error(`${v.name}: GLB-Groesse ungueltig`);
    if(new DataView(bytes).getUint32(0,true)!==0x46546c67)throw Error(`${v.name}: keine GLB-Datei`);
    if(!globalThis.crypto?.subtle)throw Error('SHA-256-Pruefung im Browser nicht verfuegbar');
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('');
    if(hash!==v.sha256)throw Error(`${v.name}: SHA-256 stimmt nicht mit Offline-Pruefung ueberein`);
   }if(!cancelled)setValidated(true);
  })().catch(e=>{if(!cancelled)setError(String(e))}).finally(()=>{if(!cancelled)setLoading(false)});
  return()=>{cancelled=true;abort.abort()};
 },[report]);
 const entries=report?.variants??[],base=entries[0]?.triangles??0;
 const urls=validated?{LOD0:entries[0].url,LOD1:entries[1].url,LOD2:entries[2].url}:null;
 return <main style={{padding:24,background:'#0b1425',color:'#edf4ff',minHeight:'100vh',fontFamily:'system-ui',lineHeight:1.5}}>
  <h1>V787 · Smart Avatar LOD Director</h1>
  <p>GLB-LOD-Varianten sicher vergleichen: Rig-/Morph-Kompatibilitaet, Distanzwechsel mit Hysterese und Tanz-/Mundanimation auf demselben logischen Zeitpunkt.</p>
  <p><code>npm run avatar:lod:v787 -- --lod0=public/avatars/artist_LOD0.glb --lod1=public/avatars/artist_LOD1.glb --lod2=public/avatars/artist_LOD2.glb</code></p>
  <label>V787-Pruefbericht importieren:{' '}<input type="file" accept=".json,application/json" onChange={e=>void load(e.currentTarget.files?.[0])}/></label>
  {error&&<p role="alert" style={{color:'#ffb9b0'}}>{error}</p>}
  {report&&<><h2>Status: {report.status==='ready'?'Rig-kompatibel (nicht visuell freigegeben)':'Blockiert'}</h2>
   {report.issues.map((s,i)=><p key={i} style={{color:'#ffcf94'}}>⚠ {s}</p>)}
   <table style={{borderCollapse:'collapse',width:'100%',maxWidth:780}}><thead><tr>{['LOD','Status','Dreiecke','Gegenüber LOD0','Tanzclips','Skin-Joints'].map(s=><th key={s} style={{textAlign:'left',padding:8}}>{s}</th>)}</tr></thead><tbody>
   {entries.map(v=><tr key={v.name}><td style={{padding:8}}>{v.name}</td><td>{v.status}</td><td>{v.triangles??'–'}</td><td>{v.triangles!==undefined&&triangleSavingsV787(base,v.triangles)!==null?`${triangleSavingsV787(base,v.triangles)} %`:'–'}</td><td>{v.clips??'–'}</td><td>{v.skinJoints??'–'}</td></tr>)}
   </tbody></table>
   {loading&&<p role="status">GLB-Dateien und SHA-256-Pruefsummen werden verifiziert…</p>}
   {validated&&urls&&<section style={{marginTop:24}}><h2>3D-Vorschau – Tanz bleibt zeitlich durchgehend</h2>
    <label>Virtuelle Kameradistanz: {distance.toFixed(1)} m <input type="range" min="2" max="11" step="0.1" value={distance} onChange={e=>setDistance(Number(e.currentTarget.value))} style={{width:240,verticalAlign:'middle',marginLeft:12}}/></label>
    <p>Aktive Variante: <strong>{active}</strong> · {reason}</p>
    <Preview urls={urls} distance={distance} onActive={(tier,why)=>{setActive(tier);setReason(why)}}/>
    <p>Die Vorschau lädt alle drei GLBs gleichzeitig, um Animationsneustarts beim LOD-Wechsel zu vermeiden. Sie ist daher <strong>kein GPU- oder VRAM-Benchmark</strong>.</p>
   </section>}
   <h2>Grenzen</h2><p>Die Offline-Pruefung vergleicht benannte Joints, Animationsziele und Morph-Targets. Hautgewichte, Deformation und visuelle Qualitaet muessen weiterhin kontrolliert werden. Es findet keine automatische Aktivierung im Live-Display statt.</p>
  </>}
 </main>;
}
