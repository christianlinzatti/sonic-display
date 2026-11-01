'use client';
/** Stable, opt-in single-canvas scene fixture for *both* older and newer builds.
 * Use scripts/v776-install-benchmark-harness.cjs to add this exact fixture to an older checkout.
 * This deliberately measures StageEnvironment + two procedural actors, NOT the full Spotify show.
 */
import {useCallback,useEffect,useRef,useState,type MutableRefObject} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {StageEnvironment,type StageEnvironmentId} from './stages';
import {BENCHMARK_STAGES_V776,summarizeSceneV776,type FrameV776,type ReportV776,type SceneV776} from '@/services/monitoring/stageBenchmarkV776';

type Collector={frames:FrameV776[];enabled:boolean};
type Controller={run:(options?:{passes?:number;warmupFrames?:number;sampleFrames?:number;label?:string})=>Promise<ReportV776>;state:()=>string};
declare global{interface Window{__sonicV776?:Controller}}
const nextFrame=()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
async function frameWait(frames:number){for(let i=0;i<frames;i++)await nextFrame();}
type RenderIdentityV776={renderer:string;viewport:string;dpr:number};
function Probe({store,identity}:{store:MutableRefObject<Collector>;identity:MutableRefObject<RenderIdentityV776>}){
  const gl=useThree(s=>s.gl);
  const size=useThree(s=>s.size);
  useEffect(()=>{const ctx=gl.getContext();
    const ext=ctx.getExtension('WEBGL_debug_renderer_info');
    const name=ext?String(ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)):String(ctx.getParameter(ctx.RENDERER));
    const vendor=ext?String(ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL)):String(ctx.getParameter(ctx.VENDOR));
    identity.current={renderer:vendor+' / '+name,viewport:Math.round(size.width)+'x'+Math.round(size.height),dpr:gl.getPixelRatio()};
  },[gl,size.width,size.height,identity]);
  useFrame((_state,delta)=>{
    if(!store.current.enabled)return;
    // Called before this render; renderer.info.* reports the previous complete draw pass.
    const ctx=gl.getContext();
    store.current.frames.push({ms:delta*1000,calls:gl.info.render.calls,triangles:gl.info.render.triangles,
      geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,programs:gl.info.programs?.length??null,
      contextLost:ctx.isContextLost()});
  });
  return null;
}
function Actor({side}:{side:number}){return <group position={[side*.85,-.65,0]}>
  <mesh position={[0,.5,0]}><capsuleGeometry args={[.24,.72,6,12]}/><meshStandardMaterial color={side<0?'#70e0fa':'#fa8ac8'}/></mesh>
  <mesh position={[0,1.15,0]}><sphereGeometry args={[.22,14,10]}/><meshStandardMaterial color="#e8b99c"/></mesh>
  <mesh position={[side*.13,-.35,0]}><boxGeometry args={[.16,.65,.2]}/><meshStandardMaterial color="#5b71a1"/></mesh>
</group>}
function allowed(){return typeof window!=='undefined'&&['localhost','127.0.0.1','::1','[::1]'].includes(window.location.hostname)
 &&new URLSearchParams(window.location.search).get('stageBenchV776')==='1'}
export function StageBenchmarkV776(){
  const [enabled,setEnabled]=useState(false),[stage,setStage]=useState<StageEnvironmentId>('classic');
  const [state,setState]=useState('ready'),[report,setReport]=useState<ReportV776|null>(null);
  const collector=useRef<Collector>({frames:[],enabled:false});const identity=useRef<RenderIdentityV776>({renderer:'unknown',viewport:'unknown',dpr:1});const lock=useRef(false);
  useEffect(()=>setEnabled(allowed()),[]);
  const run=useCallback(async(o:{passes?:number;warmupFrames?:number;sampleFrames?:number;label?:string}={}):Promise<ReportV776>=>{
    if(lock.current)throw Error('Benchmark läuft bereits');
    lock.current=true;setState('running');setReport(null);
    const passes=Math.max(1,Math.min(5,Math.trunc(o.passes??2)));
    const warmupFrames=Math.max(30,Math.min(240,Math.trunc(o.warmupFrames??60)));
    const sampleFrames=Math.max(90,Math.min(1200,Math.trunc(o.sampleFrames??240)));
    const raw:Record<string,FrameV776[]>={};
    try{
      // Two preliminary passes populate stage program/geometry caches symmetrically.
      for(let pass=-2;pass<passes;pass++)for(const name of BENCHMARK_STAGES_V776){
        collector.current.enabled=false;setStage(name);
        await frameWait(warmupFrames);
        if(pass<0)continue;
        collector.current.frames=[];collector.current.enabled=true;
        await frameWait(sampleFrames);collector.current.enabled=false;
        const frames=collector.current.frames.slice(1); // First sample may describe previous stage.
        if(frames.length<sampleFrames-3)throw Error('Zu wenige echte Render-Frames: '+name);
        const key=name;raw[key]??=[];raw[key].push(...frames);
      }
      const scenes:SceneV776[]=BENCHMARK_STAGES_V776.map(s=>summarizeSceneV776(s,raw[s]));
      const glRenderer=identity.current.renderer;
      const result:ReportV776={format:'sonic-stage-benchmark-v776',version:1,label:String(o.label||'candidate').slice(0,80),measuredAt:new Date().toISOString(),
        environment:{userAgent:navigator.userAgent,renderer:glRenderer,viewport:identity.current.viewport,dpr:identity.current.dpr,antialias:false,
          softwareRenderer:/swiftshader|llvmpipe|softpipe|software/i.test(glRenderer)},
        config:{fixtureId:'v776-fixed-stages-two-actors-v1',stages:BENCHMARK_STAGES_V776,passes,warmupFrames,sampleFrames,avatarCount:2,audioMode:'none'},scenes};
      setReport(result);setState('done');return result;
    }catch(e){setState('error: '+String(e));throw e;}finally{collector.current.enabled=false;lock.current=false;}
  },[]);
  const refRun=useRef(run);refRun.current=run;const refState=useRef(state);refState.current=state;
  useEffect(()=>{if(!enabled)return;window.__sonicV776={run:o=>refRun.current(o),state:()=>refState.current};
    return()=>{delete window.__sonicV776}},[enabled]);
  if(!enabled)return <main><h1>V776 Stage Benchmark</h1><p>Nur lokal mit ?stageBenchV776=1 aktiv.</p></main>;
  const save=()=>{if(!report)return;const file=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download='sonic-v776-stage-benchmark.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
  return <main style={{padding:18,color:'#e9f1ff',background:'#101525',minHeight:'100vh',fontFamily:'system-ui'}}>
    <h1>V776 · reproduzierbarer Bühnen-Benchmark</h1>
    <p>Dieselbe Fixture für Baseline und Kandidat · sechs echte Bühnen · zwei prozedurale Avatare · Canvas 960 × 540 · DPR 1 · AA aus.</p>
    <div style={{width:960,maxWidth:'100%',height:540}}>
      <Canvas style={{width:'100%',height:'100%'}} camera={{position:[0,.5,8],fov:45}} dpr={1}
        frameloop="always" gl={{antialias:false,powerPreference:'high-performance'}}>
        <Probe store={collector} identity={identity}/>
        <ambientLight intensity={1.25}/><directionalLight intensity={2} position={[2,4,6]}/>
        <StageEnvironment theme={stage} audio={{} as Parameters<typeof StageEnvironment>[0]['audio']} isPlaying={false} reducedMotion reactive={false}/>
        <Actor side={-1}/><Actor side={1}/>
      </Canvas>
    </div>
    <p data-v776-state={state}>Status: {state}</p>
    <button type="button" disabled={state==='running'} onClick={()=>void run().catch(()=>{})}>Benchmark starten</button>
    {' '}<button type="button" disabled={!report} onClick={save}>JSON exportieren</button>
    {report&&<table><thead><tr>{['Bühne','FPS','P95 ms','Draw Calls','Geometrien','Texturen'].map(x=><th key={x} style={{padding:8}}>{x}</th>)}</tr></thead><tbody>
      {report.scenes.map(s=><tr key={s.stage}>{[s.stage,s.fps,s.p95Ms,s.avgCalls,s.maxGeometries,s.maxTextures].map((x,i)=><td key={i} style={{padding:8,textAlign:'right'}}>{x}</td>)}</tr>)}
    </tbody></table>}
  </main>;
}
