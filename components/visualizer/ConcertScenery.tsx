'use client';
import {ConcertAtmosphere,type ConcertAtmosphereHandle} from './ConcertAtmosphere';
import {planConcertAtmosphere} from '@/lib/concertAtmosphere';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {newMotionFxState,sampleMotionEffects,type StagePoint} from '@/lib/concertMotionEffects';
import {BufferGeometry,Float32BufferAttribute,CanvasTexture,Color,DoubleSide,LinearFilter,Object3D,Vector3,Vector4,type Group,type InstancedMesh,type Mesh,type MeshBasicMaterial,type ShaderMaterial,type SpotLight} from 'three';
import type {Lyrics} from '@/types/playbackCore';
import type {ConcertScoreV1134} from '@/lib/concertScoreV1134';
import {advanceConcertAccent,advanceConcertFxCadence,concertAccentSchedule,newConcertAccentState,newConcertFxCadence,planConcertScenery,placeConcertParticle,type ConcertTier} from '@/lib/concertStageShow';
import {useCrewSettings} from './useSonicCrew';
export type ConcertSceneryGate={manual:boolean;pressure:number;lights:boolean;pulse:boolean;tier:ConcertTier};
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const fragment=`
varying vec2 vUv;uniform vec3 uPrimary,uSecondary;uniform float uTime,uOpen,uBrightness,uTextOpacity;uniform vec4 uWeights;uniform sampler2D uText;
void main(){
 vec2 p=(vUv-.5)*vec2(1.78,1.);float field;
 vec4 motifs=vec4(pow(.5+.5*sin((p.x*4.+p.y*1.3-uTime*.22)*6.283),6.),
  (.5+.5*sin(p.x*7.+sin(p.y*5.+uTime*.16)*1.5-uTime*.24))*.65,
  pow(.5+.5*sin(length(p)*22.-uTime*.25),5.),
  pow(.5+.5*sin((abs(p.x)*5.-p.y*2.-uTime*.18)*6.283),4.));
 field=dot(motifs,uWeights);
 vec2 dotCell=fract(vUv*vec2(112.,64.))-.5;float pixels=1.-smoothstep(.23,.48,length(dotCell));
 float vignette=1.-smoothstep(.22,.86,length(p));
 vec3 tint=mix(uPrimary,uSecondary,smoothstep(-.6,.6,p.x));
 vec3 color=vec3(.008,.014,.025)+tint*(.08+field*(.4+uOpen*.45))*pixels*vignette*uBrightness;
 float edge=step(.012,vUv.x)*step(vUv.x,.988)*step(.018,vUv.y)*step(vUv.y,.982);
 color=mix(vec3(.024,.032,.045),color,edge);
 vec4 text=texture2D(uText,vUv);color=mix(color,mix(vec3(.88),uPrimary,.22),text.a*uTextOpacity);
 gl_FragColor=vec4(color,1.);
 #include <colorspace_fragment>
}`;
function drawLine(canvas:HTMLCanvasElement,text:string){
 const context=canvas.getContext('2d');if(!context)return false;
 context.clearRect(0,0,canvas.width,canvas.height);if(!text)return true;
 context.font=`700 ${text.length>75?28:38}px system-ui,sans-serif`;context.textAlign='center';context.textBaseline='middle';context.fillStyle='#ffffff';
 const lines:string[]=[];let line='';
 for(const word of text.split(/\s+/)){const next=line?`${line} ${word}`:word;if(context.measureText(next).width>650&&line){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);if(lines.length>3||lines.some(l=>context.measureText(l).width>680))return false;
 lines.forEach((line,i)=>context.fillText(line,canvas.width/2,55+i*45));return true;
}
/** One LED draw, two shadow-free spots, at most one small accent draw. No independent clock. */
export function ConcertScenery({cue,lyrics,playing,reducedMotion,gate}:{cue:ConcertScoreV1134;lyrics?:Lyrics|null;playing:boolean;reducedMotion:boolean;gate:()=>ConcertSceneryGate}){
 const settings=useCrewSettings(),group=useRef<Group>(null),wall=useRef<Mesh>(null),material=useRef<ShaderMaterial>(null),particles=useRef<InstancedMesh>(null),particleMaterial=useRef<MeshBasicMaterial>(null),pulse=useRef<Mesh>(null),pulseMaterial=useRef<MeshBasicMaterial>(null),landing=useRef<Mesh>(null),landingMaterial=useRef<MeshBasicMaterial>(null);
 const atmosphere=useRef<ConcertAtmosphereHandle>(null);
 const motionFx=useRef(newMotionFxState());
 const trail=useMemo(()=>{const geometry=new BufferGeometry();geometry.setAttribute('position',new Float32BufferAttribute(new Float32Array(120),3));geometry.setDrawRange(0,0);return geometry;},[]);
 const trailMaterial=useRef<import('three').LineBasicMaterial>(null);
 useEffect(()=>()=>trail.dispose(),[trail]);
 const first=useRef<SpotLight>(null),second=useRef<SpotLight>(null),firstTarget=useRef<Object3D>(null),secondTarget=useRef<Object3D>(null);
 const weights=useMemo(()=>new Vector4(1,0,0,0),[]);
 const white=useMemo(()=>new Color('#ffffff'),[]);
 const textDrawn=useRef(false);
 const object=useMemo(()=>new Object3D(),[]),position=useMemo(()=>new Vector3(),[]),limbScale=useMemo(()=>new Vector3(),[]),color=useMemo(()=>new Color(),[]);
 const cadence=useRef(newConcertFxCadence()),accent=useRef(newConcertAccentState()),lastReport=useRef(-Infinity),lastText=useRef(''),phase=useRef(0),end=useRef({source:'',playing:false,at:-1});
 const screen=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=768;canvas.height=432;const texture=new CanvasTexture(canvas);texture.minFilter=LinearFilter;texture.magFilter=LinearFilter;texture.generateMipmaps=false;return {canvas,texture};},[]);
 useEffect(()=>()=>screen.texture.dispose(),[screen]);
 const uniforms=useMemo(()=>({uPrimary:{value:new Color('#65e6ff')},uSecondary:{value:new Color('#b59aff')},uTime:{value:0},uWeights:{value:new Vector4(1,0,0,0)},uOpen:{value:.3},uBrightness:{value:0},uTextOpacity:{value:0},uText:{value:screen.texture}}),[screen]);
 const events=useMemo(()=>concertAccentSchedule(lyrics,cue.durationMs??0),[lyrics,cue.durationMs]);
 useFrame(({scene,clock},delta)=>{
  const guard=gate(),pressure=Math.max(Number.isFinite(guard.pressure)?guard.pressure:2,advanceConcertFxCadence(cadence.current,delta,playing&&!reducedMotion));
  const plan=planConcertScenery({cue,lyrics,enabled:settings.scenery===true,playing,reducedMotion,manual:guard.manual,tier:guard.tier,pressure,strength:settings.sceneryStrength,wallLyrics:settings.sceneryLyrics});
  const room=planConcertAtmosphere({cue,active:plan.active,enabled:settings.immersiveFx!==false,playing,reducedMotion,tier:plan.budget.tier,floorAllowed:guard.pulse,scale:plan.scale});
  const source=`${cue.sourceKey}:${cue.showTakeSeed??''}`;
  const burst=advanceConcertAccent(accent.current,{source,position:cue.positionMs,now:clock.elapsedTime*1000,playing,allowed:plan.accentAllowed&&guard.pulse,events});
  if(group.current)group.current.visible=plan.active;
  if(end.current.source!==source){end.current={source,playing,at:-1};phase.current=cue.positionMs/16000;}
  if(end.current.playing&&!playing&&(cue.durationMs??0)>0&&cue.positionMs>=(cue.durationMs??0)-500)end.current.at=clock.elapsedTime;
  if(playing)end.current.at=-1;end.current.playing=playing;
  const afterglow=!reducedMotion&&end.current.at>=0?Math.max(0,1-(clock.elapsedTime-end.current.at)/4):0;
  const movementAllowed=plan.active&&plan.motion>0&&guard.pulse&&plan.budget.pulse&&settings.musicalDance!==false&&cue.act!=='breathe'&&cue.act!=='build';
  const observedPoints:(StagePoint|undefined)[]=[];
  for(const slot of [plan.leader,plan.partner===plan.leader?-1:plan.partner]){
   const root=movementAllowed&&slot>=0?scene.getObjectByName(`v377-vocal-stage-slot-${slot}`):null;
   for(const name of ['LeftHand','RightHand','LeftFoot','RightFoot']){
    const node=root?.visible?root.getObjectByName(name):undefined;
    if(node){node.getWorldPosition(position);node.getWorldScale(limbScale);observedPoints.push({x:position.x,y:position.y-(name.endsWith('Foot')?.12*Math.abs(limbScale.y):0),z:position.z,scale:Math.abs(limbScale.y)});}else observedPoints.push(undefined);
   }
  }
  // Pure sampler takes all hands first, then all feet.
  const motion=sampleMotionEffects(motionFx.current,{source:`${source}:${plan.leader}:${plan.partner}`,position:cue.positionMs,now:clock.elapsedTime,allowed:movementAllowed,points:[observedPoints[0],observedPoints[1],observedPoints[4],observedPoints[5],observedPoints[2],observedPoints[3],observedPoints[6],observedPoints[7]]});
  const segments=plan.budget.tier==='high'?motion.segments:motion.segments.slice(0,8);
  const attribute=trail.getAttribute('position');let vertex=0;
  for(const segment of segments)for(const point of segment)attribute.setXYZ(vertex++,point.x,point.y,point.z);
  attribute.needsUpdate=true;trail.setDrawRange(0,vertex);
  if(trailMaterial.current){trailMaterial.current.color.set(plan.primary);trailMaterial.current.opacity=.22*plan.scale;}
  if(landing.current&&landingMaterial.current){landing.current.visible=!!motion.landing&&!burst;if(motion.landing){landing.current.position.set(motion.landing.point.x,motion.landing.point.y,motion.landing.point.z);landing.current.scale.setScalar(.5+motion.landing.age*2);landingMaterial.current.color.set(plan.secondary);landingMaterial.current.opacity=motion.landing.gain*.24*plan.scale;}}
  const roomBlend=reducedMotion?1:1-Math.exp(-Math.min(.1,Math.max(0,delta))*1.8);
  atmosphere.current?.update(room,plan.primary,plan.secondary,phase.current*16,roomBlend);
  if(!plan.active){if(clock.elapsedTime-lastReport.current>=1){lastReport.current=clock.elapsedTime;window.dispatchEvent(new CustomEvent('sonic:concert-scenery',{detail:{source:cue.sourceKey,active:false,atmosphere:{backdrop:false,floor:false,moving:false},manual:guard.manual,led:false,projection:false,spotTargets:[],particles:0,moving:false}}));}return;}
  const fade=reducedMotion?1:1-Math.exp(-Math.min(.1,Math.max(0,delta))*2.5);
  if(plan.motion)phase.current=cue.positionMs/16000;
  if(material.current){
   const u=material.current.uniforms;u.uPrimary.value.lerp(color.set(plan.primary),fade);u.uSecondary.value.lerp(color.set(plan.secondary),fade);
   u.uTime.value=phase.current;weights.set(0,0,0,0).setComponent(plan.pattern,1);u.uWeights.value.lerp(weights,fade);u.uOpen.value+=(plan.openness-u.uOpen.value)*fade;
   const brightness=!playing?Math.min(plan.brightness,.09)+afterglow*.16:plan.brightness;
   u.uBrightness.value+=(brightness-u.uBrightness.value)*(reducedMotion?1:fade);
   if(lastText.current!==plan.textKey){lastText.current=plan.textKey;textDrawn.current=drawLine(screen.canvas,plan.text);screen.texture.needsUpdate=true;if(!textDrawn.current)u.uTextOpacity.value=0;}
   u.uTextOpacity.value+=((textDrawn.current?plan.textOpacity:0)-u.uTextOpacity.value)*(reducedMotion?1:fade);
  }
  const actualTargets:{slot:number;x:number;z:number}[]=[];
  for(const [index,light,target] of [[0,first.current,firstTarget.current],[1,second.current,secondTarget.current]] as const){
   if(!light||!target)continue;
   const slot=index===0?plan.leader:plan.partner,root=scene.getObjectByName(`v377-vocal-stage-slot-${slot}`);
   const visible=guard.lights&&index<plan.lights&&!!root?.visible&&(index===0||plan.partner!==plan.leader);
   light.visible=visible;if(!visible||!root){light.intensity=0;target.userData.concertReady=false;continue;}
   root.getWorldPosition(position);
   const x=Math.max(-4.5,Math.min(4.5,position.x)),z=Math.max(-1.4,Math.min(1.4,position.z));
   if(!target.userData.concertReady){target.position.set(x,.05,z);target.userData.concertReady=true;}
   else if(plan.motion){target.position.x+=(x-target.position.x)*fade;target.position.z+=(z-target.position.z)*fade;}
   target.position.y=.05;light.target=target;light.position.set(target.position.x+(index===0?-.35:.35),3.3,1.8);
   light.color.lerp(color.set(index===0?plan.primary:plan.secondary).lerp(white,.32),fade);
   const strength=(cue.reading?.35:cue.lyricFocus?.5:1)*plan.scale*(playing?1:.2+afterglow*.65);
   light.intensity+=(strength*1.7-light.intensity)*fade;actualTargets.push({slot,x:target.position.x,z:target.position.z});
  }
  const particleCount=burst&&burst.kind!=='floor'?plan.budget.particles:0;
  if(particles.current&&particleMaterial.current){
   particles.current.visible=particleCount>0;particles.current.count=particleCount;
   if(burst&&particleCount){
    for(let i=0;i<particleCount;i++){
     placeConcertParticle(object,burst.kind==='confetti'?'confetti':'rise',i,burst.age);object.updateMatrix();particles.current.setMatrixAt(i,object.matrix);
     particles.current.setColorAt(i,color.set(i%2?plan.primary:plan.secondary));
    }
    particles.current.instanceMatrix.needsUpdate=true;if(particles.current.instanceColor)particles.current.instanceColor.needsUpdate=true;
    particleMaterial.current.opacity=burst.gain*.75*plan.scale;
   }
  }
  if(pulse.current&&pulseMaterial.current){pulse.current.visible=!!burst&&burst.kind==='floor'&&plan.budget.pulse;if(burst){pulse.current.scale.setScalar(1+burst.age*1.5);pulseMaterial.current.color.set(plan.primary);pulseMaterial.current.opacity=burst.gain*.26*plan.scale;}}
  if(wall.current)wall.current.visible=true;
  if(clock.elapsedTime-lastReport.current>=1){lastReport.current=clock.elapsedTime;window.dispatchEvent(new CustomEvent('sonic:concert-scenery',{detail:{source:cue.sourceKey,active:true,atmosphere:{scene:room.scene,motif:room.motif,moving:room.moving,...atmosphere.current?.read()},refrainVisit:plan.refrainVisit,scene:afterglow>0?'afterglow':plan.scene,pattern:plan.pattern,mix:material.current?.uniforms.uWeights.value.toArray(),tier:plan.budget.tier,pressure,led:!!wall.current?.visible,projection:textDrawn.current&&plan.text.length>0&&(material.current?.uniforms.uTextOpacity.value??0)>.01,spotTargets:actualTargets,particles:particleCount,motionSegments:segments.length,landing:!!motion.landing&&!burst,accent:burst?.id??null,moving:plan.motion>0}}));}
 });
 return <group ref={group} name="concert-show-scenery" visible={false}>
  <ConcertAtmosphere ref={atmosphere}/>
  <mesh ref={wall} name="concert-led-wall" position={[0,.05,-3.30]}><planeGeometry args={[6.8,3.8]}/><shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertex} fragmentShader={fragment} toneMapped={false}/></mesh>
  <spotLight ref={first} visible={false} intensity={0} position={[-1,3.3,1.8]} angle={.42} penumbra={1} distance={12} decay={2} castShadow={false}/>
  <spotLight ref={second} visible={false} intensity={0} position={[1,3.3,1.8]} angle={.42} penumbra={1} distance={12} decay={2} castShadow={false}/>
  <object3D ref={firstTarget}/><object3D ref={secondTarget}/>
  <instancedMesh ref={particles} args={[undefined,undefined,32]} visible={false} frustumCulled={false}><planeGeometry args={[.04,.065]}/><meshBasicMaterial ref={particleMaterial} transparent opacity={0} side={DoubleSide} depthWrite={false} toneMapped={false}/></instancedMesh>
  <lineSegments geometry={trail} frustumCulled={false}><lineBasicMaterial ref={trailMaterial} transparent opacity={0} depthWrite={false} toneMapped={false}/></lineSegments>
  <mesh ref={landing} visible={false} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.15,.17,32]}/><meshBasicMaterial ref={landingMaterial} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
  <mesh ref={pulse} visible={false} position={[0,-1.92,-.65]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.55,.58,64]}/><meshBasicMaterial ref={pulseMaterial} transparent opacity={0} depthWrite={false} toneMapped={false}/></mesh>
 </group>;
}
