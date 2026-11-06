'use client';
import {useOwnedAvatarResourcesV1009} from './useOwnedAvatarResourcesV1009';
/** V767 optional, loopback-only diagnostic; tests the real StageEnvironment and GLB cache/skeleton lifetime.
 * NOT a measurement of the whole Spotify concert scene. No WebGL resources are allocated until opt-in.
 */
import {Suspense,useCallback,useEffect,useMemo,useRef,useState,type MutableRefObject} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {usePreviewGltfCacheV654,getPreviewGltfCacheStatsV768} from './usePreviewGltfCacheV654';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
import {StageEnvironment,type StageEnvironmentId} from './stages';
import {assessGpuMemoryV767,type GpuSampleV767,type GpuAssessmentV767} from '@/services/monitoring/gpuMemoryLeakV767';

const stages:StageEnvironmentId[]=['classic','galaxy','cyberpunk','white','rock','vaporwave'];
const anchor='procedural-a';
type Probe = ()=>Omit<GpuSampleV767,'cycle'|'step'|'stage'|'avatar'|'phase'>;
type V767Result = {format:'sonic-v767-gpu-memory';version:1;scope:string;status:string;assessment:GpuAssessmentV767;
  samples:GpuSampleV767[];cycles:number;warmupCycles:number;models:string[];finishedAt:string};
type Control = {run:(cycles?:number)=>Promise<V767Result>;state:()=>({running:boolean;completed:boolean;result:V767Result|null});
  snapshot:()=>ReturnType<Probe>|null;cache:()=>ReturnType<typeof getPreviewGltfCacheStatsV768>};
declare global {interface Window {__sonicV767?:Control}}
function RendererProbe({reader}:{reader:MutableRefObject<Probe|null>}){
  const gl=useThree(s=>s.gl);
  useEffect(()=>{
    reader.current=()=>{
      const heap=(performance as Performance & {memory?:{usedJSHeapSize?:number}}).memory?.usedJSHeapSize;
      return {geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,
        programs:gl.info.programs?.length??null,drawCalls:gl.info.render.calls,triangles:gl.info.render.triangles,
        contextLost:gl.getContext().isContextLost(),jsHeapBytes:typeof heap==='number'?heap:null};
    };
    return ()=>{reader.current=null;};
  },[gl,reader]);
  return null;
}
function SimpleAvatar({variant,onReady}:{variant:string;onReady:(value:string)=>void}){
  useEffect(()=>onReady(variant),[variant,onReady]);
  // Two finite avatar variants; deliberate fresh geometries/materials on each switch.
  return <group position={[0,-.55,0]} name={`GpuAvatar-${variant}`}>
    <mesh position={[0,.15,0]}><capsuleGeometry args={[.32,.85,8,16]}/><meshStandardMaterial color={variant==='procedural-a'?'#8e9eff':'#fc8ec4'}/></mesh>
    <mesh position={[0,.97,0]}><sphereGeometry args={[.31,20,14]}/><meshStandardMaterial color="#e5c2a4"/></mesh>
    {[-1,1].map(x=><mesh key={x} position={[x*.48,.06,0]} rotation={[0,0,x*.24]}><capsuleGeometry args={[.11,.65,5,10]}/><meshStandardMaterial color="#4c5482"/></mesh>)}
  </group>;
}
function GlbActor({url,id,onReady}:{url:string;id:string;onReady:(value:string)=>void}){
  const {scene}=useGLTF(url);
  usePreviewGltfCacheV654(url);
  const model=useMemo(()=>cloneSkinnedScene(scene),[scene]);
  useOwnedAvatarResourcesV1009(model);
  useEffect(()=>{onReady(id);return ()=>{disposeClonedAvatarSkeletonsV654(model);};},[model,id,onReady]);
  // Cached originals remain owned by useGLTF; this clone owns its render resources.
  return <primitive object={model} dispose={null} scale={1.3} position={[0,-.95,0]}/>;
}
const nextFrames=(count=4)=>new Promise<void>(resolve=>{
  const tick=(remaining:number)=>remaining<=0?resolve():requestAnimationFrame(()=>tick(remaining-1));
  tick(count);
});
const delay=(ms:number)=>new Promise<void>(resolve=>setTimeout(resolve,ms));
function getLocalModels():string[]{
  if(typeof window==='undefined')return [];
  const params=new URLSearchParams(window.location.search);
  const inputs=params.getAll('model').slice(0,4),unique=new Set<string>();
  for(const value of inputs){
    try{const url=new URL(value,window.location.origin);
      if(url.origin===window.location.origin && /\.(glb|gltf)$/i.test(url.pathname))unique.add(url.pathname+url.search);
    }catch{}
  }
  return [...unique];
}
function allowed():boolean{
  if(typeof window==='undefined')return false;
  return ['localhost','127.0.0.1','::1','[::1]'].includes(window.location.hostname) &&
    new URLSearchParams(window.location.search).get('gpuLeakV767')==='1';
}
export function GpuMemoryStressV767(){
  const [enabled,setEnabled]=useState(false);
  const [models,setModels]=useState<string[]>([]);
  const [stage,setStage]=useState<StageEnvironmentId>('classic');
  const [avatar,setAvatar]=useState(anchor);
  const [ready,setReady]=useState(anchor);
  const [running,setRunning]=useState(false);
  const [result,setResult]=useState<V767Result|null>(null);
  const [error,setError]=useState('');
  const capture=useRef<Probe|null>(null);
  const isRunning=useRef(false),currentReady=useRef(anchor);
  useEffect(()=>{setEnabled(allowed());setModels(getLocalModels());},[]);
  const markReady=useCallback((id:string)=>{currentReady.current=id;setReady(id);},[]);
  const avatarIds=['procedural-a','procedural-b',...models.map((_,i)=>`glb-${i}`)];
  const choose=async(nextStage:StageEnvironmentId,nextAvatar:string)=>{
    currentReady.current=currentReady.current===nextAvatar?currentReady.current:'';
    setStage(nextStage);setAvatar(nextAvatar);
    const start=performance.now();
    do {await nextFrames(3);if(performance.now()-start>20000)throw Error(`Avatar ${nextAvatar} nicht innerhalb von 20s geladen`);}
    while(currentReady.current!==nextAvatar);
    await nextFrames(3); // let the renderer finish allocating and releasing GPU buffers
  };
  const run=useCallback(async(cycles=30):Promise<V767Result>=>{
    if(isRunning.current)throw Error('GPU-Stresstest läuft bereits');
    const count=Math.max(8,Math.min(100,Math.floor(Number(cycles)||30)));
    isRunning.current=true;setRunning(true);setError('');setResult(null);
    const samples:GpuSampleV767[]=[];
    try{
      if(!capture.current)throw Error('Echter WebGL-Renderer nicht bereit');
      let step=0;
      for(let cycle=-2;cycle<count;cycle++){
        // Warm-up every finite stage/model pair twice; do not label cache population a leak.
        const phase=cycle<0?'warmup':'measure';
        for(const nextStage of stages){
          for(const nextAvatar of avatarIds){
            await choose(nextStage,nextAvatar);
            const snapshot=capture.current?.();if(!snapshot)throw Error('Renderer wurde abgehängt');
            samples.push({cycle:cycle+1,step:++step,stage:nextStage,avatar:nextAvatar,phase,...snapshot});
            if(snapshot.contextLost)throw Error('WebGL-Kontext während des Stresstests verloren');
          }
        }
        await choose('classic',anchor);
        const baseline=capture.current?.();if(!baseline)throw Error('Ankerszene nicht messbar');
        samples.push({cycle:cycle+1,step:++step,stage:'classic',avatar:anchor,phase,...baseline});
        await delay(30);
      }
      const assessment=assessGpuMemoryV767(samples.filter(s=>s.phase==='measure'&&s.stage==='classic'&&s.avatar===anchor && s.step % (stages.length*avatarIds.length+1)===0));
      // Anchor is sampled twice per cycle: above filter selects only the explicit final checkpoint.
      const report:V767Result={format:'sonic-v767-gpu-memory',version:1,scope:models.length?'stage-and-configured-glb-models':'stage-and-procedural-avatars',
        status:assessment.status,assessment,samples,cycles:count,warmupCycles:2,models,finishedAt:new Date().toISOString()};
      setResult(report);return report;
    }catch(e){setError(e instanceof Error?e.message:String(e));throw e;}
    finally{isRunning.current=false;setRunning(false);}
  },[models]);
  const lastRun=useRef(run);lastRun.current=run;
  const lastResult=useRef<V767Result|null>(result);lastResult.current=result;
  const runningRef=useRef(running);runningRef.current=running;
  useEffect(()=>{
    if(!enabled)return;
    window.__sonicV767={run:(count?:number)=>lastRun.current(count),state:()=>({running:runningRef.current,completed:!!lastResult.current,result:lastResult.current}),
      snapshot:()=>capture.current?.()??null,cache:()=>getPreviewGltfCacheStatsV768()};
    return ()=>{delete window.__sonicV767;};
  },[enabled]);
  if(!enabled)return <main><h1>GPU-Diagnose V767</h1><p>Nur lokal mit ?gpuLeakV767=1 verfügbar. Keine GPU-Diagnose gestartet.</p></main>;
  const activeUrl=avatar.startsWith('glb-')?models[Number(avatar.slice(4))]:null;
  return <main style={{padding:24,background:'#0d1222',color:'#f1f5ff',minHeight:'100vh',fontFamily:'system-ui'}} data-v767-status={running?'running':result?.status??'ready'}>
    <h1>V767 · GPU-Speicher-Stresstest</h1>
    <p>Echte Three.js-Bühnen, ein WebGL-Canvas und {avatarIds.length} Avatar-Varianten; 2 Warm-up-Zyklen, danach 30 Messzyklen standardmäßig. Keine Spotify-Verbindung erforderlich.</p>
    <div style={{width:'min(100%,850px)',height:400,border:'1px solid #394060'}}>
      <Canvas camera={{position:[0,.5,8],fov:45}} dpr={1} gl={{antialias:false,powerPreference:'high-performance'}} frameloop="always">
        <RendererProbe reader={capture}/><ambientLight intensity={1.3}/><directionalLight position={[2,4,6]} intensity={2}/>
        <StageEnvironment theme={stage} audio={{} as Parameters<typeof StageEnvironment>[0]['audio']} isPlaying={false} reducedMotion reactive={false}/>
        <Suspense fallback={null}>{activeUrl
          ? <GlbActor key={avatar} url={activeUrl} id={avatar} onReady={markReady}/>
          : <SimpleAvatar key={avatar} variant={avatar} onReady={markReady}/>}</Suspense>
      </Canvas>
    </div>
    <p data-v768-cache-stats={JSON.stringify(getPreviewGltfCacheStatsV768())}>V768 GLB-Cache (Schätzung): {getPreviewGltfCacheStatsV768().activeEntries} aktive / {getPreviewGltfCacheStatsV768().idleEntries} inaktive Quellen; inaktive dekodierte Daten ca. {(getPreviewGltfCacheStatsV768().idleEstimatedBytes/1048576).toFixed(1)} MiB (Budget 96 MiB). Kein VRAM-Messwert.</p>
    <p data-v767-stage={stage} data-v767-avatar={avatar}>Bühne: {stage} · Avatar: {avatar} · Bereit: {ready}</p>
    <button type="button" disabled={running} onClick={()=>void run(30).catch(()=>{})} style={{padding:12}}>30 Zyklen starten</button>
    <button type="button" disabled={running} onClick={()=>void run(90).catch(()=>{})} style={{padding:12,marginLeft:12}} data-v771-longrun>90 Zyklen (einfacher Schnelltest) starten</button>
    <p>Für die erweiterte Langzeit-Auswertung über mehrere Blöcke: <code>npm run test:v771:browser</code>. Dabei bleibt derselbe Renderer über alle Blöcke erhalten.</p>
    {running&&<p role="status">WebGL-Zyklen laufen …</p>}{error&&<p role="alert">Fehler: {error}</p>}
    {result&&<section data-v767-result={result.status}><h2>Ergebnis: {result.status}</h2>
      <p>Geometrien Δ {result.assessment.growth.geometries}, Texturen Δ {result.assessment.growth.textures}, Shader Δ {result.assessment.growth.programs??'nicht messbar'}.</p>
      <p>{result.assessment.warnings.join(' ')||'Keine anhaltende Zunahme der WebGL-Objektzahlen erkannt.'}</p>
      <button type="button" onClick={()=>{const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);
        const a=document.createElement('a');a.href=url;a.download='gpu-memory-v767.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>JSON-Bericht herunterladen</button>
    </section>}
    <p>Hinweis: renderer.info.memory misst Ressourcenanzahlen, keine VRAM-Bytes. Stabil bedeutet nicht nachweislich leak-frei.
      Ohne model-Parameter werden nur prozedurale Avatare geprüft. Optional: &amp;model=/assets/dein-avatar.glb</p>
  </main>;
}
