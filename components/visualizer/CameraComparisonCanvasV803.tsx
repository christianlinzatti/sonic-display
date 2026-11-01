'use client';
import {Suspense,useEffect,useMemo,useRef,useState,type ReactNode,Component} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {useGLTF} from '@react-three/drei';
import {AnimationMixer,Box3,PerspectiveCamera,Vector2,Vector3, type Object3D} from 'three';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {DynamicStage} from './DynamicStage';
import type {AudioFeatures} from '@/types/audio';
import type {StageEnvironmentId} from './stages';
import type {CameraPose} from './stageCameraPoseHelpersV289';
import type {ComparisonViewV803} from './visualConcertComparisonV803';
import {inspectProjectedFramingV804,type FramingAuditV804,type PerformerEvidenceV804,type ProjectedPointV804} from './cinematicFramingInspectorV804';
import {inspectMultiPerformerVisibilityV805,type MultiAuditV805,type PerformerPreviewV805,type PerformerSampleV805} from './multiPerformerVisibilityV805';
import {usePreviewGltfCacheV654} from './usePreviewGltfCacheV654';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';
const audio:AudioFeatures={bass:0,mids:0,highs:0,volume:0,beat:false,beatStrength:0,bpm:120,kick:0,snare:0,hiHat:0,energyEnvelope:0,attack:0,decay:0};
const DRAW_BUFFER=new Vector2();
type FramingPairV804={key:string;before:FramingAuditV804;after:FramingAuditV804;
  multiBefore:MultiAuditV805;multiAfter:MultiAuditV805};
const HEAD_BONE_V804=/(^|[^a-z])(head|kopf)([^a-z]|$)|(?:mixamorig|bip\d*|def)[_:.\-]*head/i;
const LEFT_FOOT_V804=/(left.*(?:foot|ankle)|(?:foot|ankle).*left|l[_:.\-](?:foot|ankle)|mixamorigleftfoot)/i;
const RIGHT_FOOT_V804=/(right.*(?:foot|ankle)|(?:foot|ankle).*right|r[_:.\-](?:foot|ankle)|mixamorigrightfoot)/i;
function ReviewCameras({before,after,auditKey,performerModelsV805,onInspection}:{before:CameraPose;after:CameraPose;
  auditKey:string;performerModelsV805:readonly PerformerPreviewV805[];onInspection:(report:FramingPairV804)=>void}){
  const {gl,scene,invalidate}=useThree();
  const cameras=useMemo(()=>[new PerspectiveCamera(),new PerspectiveCamera()] as const,[]);
  const last=useRef('');
  const work=useMemo(()=>({box:new Box3(),point:new Vector3()}),[]);
  useEffect(()=>{
    [before,after].forEach((pose,i)=>{
      const cam=cameras[i];cam.position.set(pose.x,pose.y,pose.z);
      cam.lookAt(pose.targetX??0,pose.targetY,pose.targetZ??0);
      cam.near=.1;cam.far=80;cam.fov=pose.fov;
      cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
    });
    invalidate();
  },[before,after,cameras,invalidate]);
  // One scene, ONE GLB and ONE WebGL context. The same animation-frame scene
  // is rendered into both scissor halves with two *preview* camera poses.
  useFrame(()=>{
    gl.getDrawingBufferSize(DRAW_BUFFER);
    const width=Math.round(DRAW_BUFFER.x),height=Math.round(DRAW_BUFFER.y);
    const left=Math.floor(width/2),right=width-left;
    if(!left||!right||!height)return;
    gl.setScissorTest(true);
    try{
      for(let i=0;i<2;i++){
        const x=i===0?0:left,w=i===0?left:right,cam=cameras[i];
        cam.aspect=w/height;cam.updateProjectionMatrix();
        gl.setViewport(x,0,w,height);gl.setScissor(x,0,w,height);
        gl.clear(true,true,true);gl.render(scene,cam);
      }
      // Geometry is probed AFTER both render passes, from the SAME frozen model.
      // No pixels, extra render targets or extra WebGL contexts are read/created.
      const models=performerModelsV805.length?performerModelsV805:[];
      // Loading, missing, and demo performers are never certified as actual GLBs.
      const actors=models.length?models.map((p,i)=>scene.getObjectByName(i===0?'v804-glb-performer':`v805-glb-performer-${i+1}`)??null):
        [scene.getObjectByName('v804-glb-performer')??scene.getObjectByName('v804-demo-performer')??null];
      const identity=`${auditKey}:${actors.map(a=>a?.uuid??'loading').join(':')}:${width}:${height}`;
      if(last.current!==identity){
        last.current=identity;
        const perCamera=cameras.map(cam=>actors.map((performer):PerformerEvidenceV804|null=>{
          if(!performer)return null;
          performer.updateWorldMatrix(true,true);
          work.box.setFromObject(performer);
          const {min,max}=work.box;
          const project=(x:number,y:number,z:number):ProjectedPointV804=>{
            work.point.set(x,y,z).project(cam);
            return {x:(work.point.x+1)/2,y:(1-work.point.y)/2,z:work.point.z};
          };
          const bounds:ProjectedPointV804[]=[];
          for(const x of [min.x,max.x])for(const y of [min.y,max.y])
            for(const z of [min.z,max.z])bounds.push(project(x,y,z));
          let head:Object3D|null=null,left:Object3D|null=null,right:Object3D|null=null;
          if(performer.name==='v804-glb-performer'||performer.name.startsWith('v805-glb-performer-'))performer.traverse(object=>{
            if(object.type!=='Bone')return;
            if(!head&&HEAD_BONE_V804.test(object.name))head=object;
            if(!left&&LEFT_FOOT_V804.test(object.name))left=object;
            if(!right&&RIGHT_FOOT_V804.test(object.name))right=object;
          });
          const projectBone=(bone:Object3D)=>{
            bone.getWorldPosition(work.point);return project(work.point.x,work.point.y,work.point.z);
          };
          const headBone=head as Object3D|null;
          const leftBone=left as Object3D|null;
          const rightBone=right as Object3D|null;
          return {source:performer.name==='v804-glb-performer'||performer.name.startsWith('v805-glb-performer-')?'glb':'demo',bounds,
            head:headBone?projectBone(headBone):undefined,
            feet:leftBone&&rightBone?[projectBone(leftBone),projectBone(rightBone)]:[],
            headBone:!!headBone,footBones:!!leftBone&&!!rightBone,performerCount:actors.length};
        }));
        const samples=(idx:number):PerformerSampleV805[]=>models.map((p,i)=>({id:p.id,label:p.label,evidence:perCamera[idx][i]}));
        const firstBefore=perCamera[0][0]??null,firstAfter=perCamera[1][0]??null;
        onInspection({key:auditKey,
          before:inspectProjectedFramingV804(firstBefore),after:inspectProjectedFramingV804(firstAfter),
          multiBefore:inspectMultiPerformerVisibilityV805(samples(0),models.length),
          multiAfter:inspectMultiPerformerVisibilityV805(samples(1),models.length)});
      }
    }finally{
      gl.setScissorTest(false);
      gl.setViewport(0,0,width,height);
    }
  },1);
  return null;
}
function FallbackPerformer({name="v804-demo-performer",offsetX=0}:{name?:string;offsetX?:number}={}){
  return <group name={name} position={[offsetX,0,0]}>
    <mesh position={[0,1.0,0]}><capsuleGeometry args={[.32,.85,8,14]}/><meshStandardMaterial color="#668fbd"/></mesh>
    <mesh position={[0,1.84,0]}><sphereGeometry args={[.24,16,12]}/><meshStandardMaterial color="#ebbaa1"/></mesh>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*.43,1.08,0]} rotation={[0,0,side*.16]}><capsuleGeometry args={[.1,.78,6,9]}/><meshStandardMaterial color="#8ca4cb"/></mesh>
      <mesh position={[side*.17,.44,0]}><capsuleGeometry args={[.13,.77,6,9]}/><meshStandardMaterial color="#354e7c"/></mesh>
    </group>)}
  </group>;
}
function FrozenGlb({url,progressMs,actorName="v804-glb-performer",offsetX=0}:
  {url:string;progressMs:number;actorName?:string;offsetX?:number}){
  const gltf=useGLTF(url);
  const invalidate=useThree(state=>state.invalidate);
  usePreviewGltfCacheV654(url);
  const model=useMemo(()=>{
    const copy=cloneSkinnedScene(gltf.scene);
    const box=new Box3().setFromObject(copy),height=box.max.y-box.min.y;
    if(Number.isFinite(height)&&height>.001){
      const k=Math.max(.03,Math.min(4,2.2/height)),center=box.getCenter(new Vector3());
      copy.scale.multiplyScalar(k);
      copy.position.set(-center.x*k,-box.min.y*k,-center.z*k);
    }
    return copy;
  },[gltf.scene]);
  useEffect(()=>{
    // Identical frozen pose for both cameras. First embedded clip is a review
    // sample, NEVER described as a verified song-aligned dance performance.
    const clip=gltf.animations[0],mixer=clip?new AnimationMixer(model):null;
    if(clip&&mixer&&Number.isFinite(clip.duration)&&clip.duration>0){
      mixer.clipAction(clip).play();mixer.setTime((progressMs/1000)%clip.duration);
      invalidate();
      invalidate();
    }
    invalidate(); // Also probe newly loaded GLBs with no embedded animation.
    return()=>{mixer?.stopAllAction();mixer?.uncacheRoot(model);};
  },[gltf.animations,model,progressMs,invalidate]);
  useEffect(()=>()=>disposeClonedAvatarSkeletonsV654(model),[model]);
  return <group name={actorName} position={[offsetX,0,0]}><primitive object={model} dispose={null}/></group>;
}
class GlbFallbackV803 extends Component<{children:ReactNode;offsetX?:number;name?:string},{failed:boolean}>{
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<FallbackPerformer offsetX={this.props.offsetX??0} name={this.props.name??"v804-demo-performer"}/>:this.props.children;}
}
/** Isolated static WebGL review: stage is real DynamicStage, not a screenshot of
 * the running concert. Mounted ONLY after an explicit UI click. No streams. */
export function CameraComparisonCanvasV803({view,modelUrl,performerModelsV805,stageTheme}:{
  view:ComparisonViewV803;modelUrl:string|null;performerModelsV805?:readonly PerformerPreviewV805[];stageTheme:StageEnvironmentId}){
  const safeUrl=modelUrl&&/^(https?:\/\/|\/|blob:)/i.test(modelUrl)?modelUrl:null;
  const models=performerModelsV805?.filter(p=>/^(https?:\/\/|\/|blob:)/i.test(p.url))??[];
  const uniqueModels=models.filter((p,i)=>models.findIndex(q=>q.id===p.id||q.url===p.url)===i).slice(0,3);
  const reviewModels=uniqueModels.length&&safeUrl===uniqueModels[0].url?uniqueModels:
    (safeUrl?[{id:'lead',label:'Hauptavatar',url:safeUrl}]:[]);
  const modelSignature=reviewModels.map(p=>`${p.id}:${p.url}`).join('|');
  const auditKey=`${view.trackId}:${view.sceneIndex}:${view.progressMs}:${view.before}:${view.after}:${modelSignature||'demo'}:${stageTheme}`;
  const [inspection,setInspection]=useState<FramingPairV804|null>(null);
  const currentInspection=inspection?.key===auditKey?inspection:null;
  const tone=(status:string)=>status==='clear'?'gut':status==='risk'?'pruefen':'offen';
  const overlay=(result:FramingAuditV804|null)=>result?.source==='geometry-review'&&result.bounds?(
    <div className="v804-view-overlay" aria-hidden="true">
      <div className="v804-lyric-zone"/>
      <div className="v804-outline" style={{left:`${Math.max(0,result.bounds.left)*100}%`,
        top:`${Math.max(0,result.bounds.top)*100}%`,
        width:`${Math.max(0,Math.min(1,result.bounds.right)-Math.max(0,result.bounds.left))*100}%`,
        height:`${Math.max(0,Math.min(1,result.bounds.bottom)-Math.max(0,result.bounds.top))*100}%`}}/>
      {result.head&&<div className="v804-head-point" style={{left:`${result.head.x*100}%`,top:`${result.head.y*100}%`}}/>}
    </div>):<div className="v804-view-overlay" aria-hidden="true"><div className="v804-lyric-zone"/></div>;
  return <div className="v803-webgl" role="group" aria-label="Zwei WebGL-Kameraperspektiven derselben 3D-Bühne">
    <div className="v803-canvas-labels"><span>VORHER · {view.before}</span><span>NACHHER · {view.after}</span></div>
    <div className="v803-canvas-frame"><Canvas key={`${view.trackId}:${view.sceneIndex}:${stageTheme}:${modelSignature||'demo'}`} frameloop="demand"
      dpr={[1,1.25]} gl={{antialias:true,alpha:false,powerPreference:'low-power'}}
      camera={{position:[0,2,7],fov:45,near:.1,far:80}}
      fallback={<p role="status">WebGL ist in diesem Browser nicht verfügbar.</p>}>
      <color attach="background" args={["#0a1120"]}/>
      <ambientLight intensity={.95}/>
      <directionalLight position={[3,6,4]} intensity={1.15}/>
      <DynamicStage theme={stageTheme} audio={audio} isPlaying={false}
        reducedMotion={true} reactive={false} strength={50}/>
      {reviewModels.length?reviewModels.map((performer,i)=>{
        // Static stage spacing is for a visibility review, not a verified live formation.
        const offsetX=(i-(reviewModels.length-1)/2)*1.35;
        const name=i===0?'v804-glb-performer':`v805-glb-performer-${i+1}`;
        return <GlbFallbackV803 key={`${performer.id}:${performer.url}`} offsetX={offsetX} name={`v805-demo-performer-${i+1}`}>
          <Suspense fallback={<FallbackPerformer offsetX={offsetX} name={`v805-demo-performer-${i+1}`}/>}>
            <FrozenGlb url={performer.url} progressMs={view.progressMs} actorName={name} offsetX={offsetX}/>
          </Suspense>
        </GlbFallbackV803>;
      }):<FallbackPerformer/>}
      <ReviewCameras before={view.beforePose} after={view.afterPose} auditKey={auditKey} performerModelsV805={reviewModels} onInspection={setInspection}/>
    </Canvas>
      <div className="v804-overlays" aria-hidden="true">{(['before','after'] as const).map((side,i)=>{
        const result=currentInspection?.[side]??null;
        const group=currentInspection?.[i===0?'multiBefore':'multiAfter'];
        return <div className="v805-overlay-side" key={side}>
          {overlay(result)}
          {group?.performers.map((p,k)=>p.audit.source==='geometry-review'&&p.audit.bounds?<div key={p.id}
            className="v805-performer-outline" style={{left:`${Math.max(0,p.audit.bounds.left)*100}%`,
            top:`${Math.max(0,p.audit.bounds.top)*100}%`,
            width:`${Math.max(0,Math.min(1,p.audit.bounds.right)-Math.max(0,p.audit.bounds.left))*100}%`,
            height:`${Math.max(0,Math.min(1,p.audit.bounds.bottom)-Math.max(0,p.audit.bounds.top))*100}%`}}>
            <span>{k+1}</span></div>:null)}
        </div>;
      })}</div>
    </div>
    <section className="v804-inspector" aria-label="V804 Cinematic Framing und Sichtbarkeit">
      <h5>V804 · Cinematic Framing &amp; Visibility Inspector</h5>
      <p className="v803-disclaimer">Reale GLB-Projektion im eingefrorenen Vorschauframe. Hellblau: projizierte Körpergrenzen und Kopfmarkierung; Schraffur: angenommene untere Lyrics-Reserve (keine tatsächliche Textüberlagerung).</p>
      <div className="v804-inspector-grid">{(['before','after'] as const).map((side,i)=>{
        const result=currentInspection?.[side]??null;
        return <div key={side}>
          <strong>{i===0?'VORHER':'NACHHER'}</strong>
          <small>{result?.source==='geometry-review'?'GLB-Geometrie':result?.source==='demo-only'?'Demo: keine GLB-Messung':'Noch keine GLB-Messung'}</small>
          <ul>{(result?.checks??[]).map(check=><li key={check.id} className={`v804-${tone(check.status)}`}>
            <span><b>{check.title}</b> · {check.status==='clear'?'im Bild':check.status==='risk'?'prüfen':'nicht verifiziert'}</span>
            <small>{check.detail}</small>
          </li>)}</ul>
          {!result&&<p role="status">Messung ausstehend. Keine Bewertung.</p>}
        </div>;
      })}</div>
      <small>Keine Pixel-Okklusionsmessung, keine echte Live-Kamera, keine Mehrpersonen-Garantie. Fußkontakt, Augenrichtung und tatsächliche Lyrics-Überdeckung bleiben ungeprüft. Der Inspector verändert keine Einstellungen.</small>
    </section>
    <section className="v805-multi-inspector" aria-label="V805 Multi-Performer Visibility Studio" data-v805-inspector>
      <h5>V805 · Multi-Performer Visibility Studio</h5>
      <p>Geprüft werden nur tatsächlich geladene, ausdrücklich ausgewählte GLB-Avatare in einer statischen Vorschauaufstellung.
        Keine verifizierte Sängerzuordnung oder Überdeckung aus Pixeln.</p>
      <div className="v804-inspector-grid">{(['multiBefore','multiAfter'] as const).map((side,i)=>{
        const result=currentInspection?.[side];
        return <div key={side}><strong>{i===0?'VORHER':'NACHHER'}</strong>
          <small>{result?.verifiedCount??0} von {reviewModels.length} GLB-Performern geometrisch geprüft</small>
          {result?.checks.map(item=><p key={item.id} className={`v804-${tone(item.status)}`}>
            <b>{item.id==='group'?'Gruppenbild':item.id==='heads'?'Köpfe':item.id==='spacing'?'Abstand':item.id==='feet'?'Füße':'Lyrics-Reserve'} · {item.status==='clear'?'im Bild':item.status==='risk'?'prüfen':'nicht verifiziert'}</b>
            <small>{item.detail}</small>
          </p>)}
          {!result&&<p role="status">Gruppenmessung ausstehend.</p>}
        </div>;
      })}</div>
      <small>Die Körperrechtecke können eine mögliche Überdeckung melden, aber kein tatsächliches Verdecken eines Gesichts feststellen. Ein Performer außerhalb der Vorschau entspricht nicht automatisch dem Live-Bild. Bei fehlenden GLBs erfolgt keine Freigabe.</small>
    </section>
    <small>{safeUrl?'Ausgewählte GLBs; erster eingebetteter Animationsclip pro Avatar als statische Probe, sofern vorhanden.':'Demo-Performer, da kein GLB zugewiesen ist.'} Zwei Kameras · eine Bühne · ein WebGL-Kontext.</small>
  </div>;
}
