"use client";
import {useFrame} from "@react-three/fiber";
import {useLayoutEffect,useMemo,useRef} from "react";
import {Color,Object3D,type Group,type InstancedMesh,type MeshBasicMaterial} from "three";
import type {AudioFeatures} from "@/types/audio";
import {useAdaptivePerformance} from "../adaptivePerformance";
import {createArenaAudienceV1032} from "@/lib/arena360ExperienceV1032";
import {planArenaTimelineV1035,sampleArenaCrowdHookV1035} from "@/lib/arena360DirectorV1035";
import {sampleArenaAudienceV1044,type ArenaAudienceCueV1044} from "@/lib/arena360AudienceDirectorV1044";
import {INITIAL_ARENA_WAVE_V1033,stepArenaWaveV1033,sampleArenaCrowdWaveV1033,
  sampleArenaPhoneV1033,type ArenaPhoneModeV1033} from "@/lib/arena360ImmersionV1033";

const SHIRT_COLORS=['#172a4a','#383058','#193b50','#453456','#243f55'];
const PHONE_COLORS=['#7af4ff','#ef73ff','#faf1a9'];

/** Batched, stage-fixed crowd and phones; v1033 updates matrices on a capped clock.
 * No state updates in useFrame and no GPU skinning or skeletal crowd assets.
 */
export function ArenaAudienceV1032({audio,playing,reducedMotion,enabled=true,reactive=true,
  wavesEnabled=true,phoneSyncEnabled=true,phoneMode='wave',hookCueEnabled=true,
  progressMs=0,durationMs=0,fullSongDirectorEnabled=true,showIntensity=65,section='verse',audienceCueV1044}:{
  audio:AudioFeatures;playing:boolean;reducedMotion:boolean;enabled?:boolean;reactive?:boolean;
  wavesEnabled?:boolean;phoneSyncEnabled?:boolean;phoneMode?:ArenaPhoneModeV1033;
  hookCueEnabled?:boolean;progressMs?:number;durationMs?:number;
  fullSongDirectorEnabled?:boolean;showIntensity?:number;section?:string;audienceCueV1044?:ArenaAudienceCueV1044;
}){
  const tier=useAdaptivePerformance().tier;
  const members=useMemo(()=>createArenaAudienceV1032(tier,enabled),[tier,enabled]);
  const count=members.length;
  const bodies=useRef<InstancedMesh>(null),heads=useRef<InstancedMesh>(null),phones=useRef<InstancedMesh>(null);
  const pulseMaterial=useRef<MeshBasicMaterial>(null),crowd=useRef<Group>(null);
  const dummy=useMemo(()=>new Object3D(),[]),tint=useMemo(()=>new Color(),[]);
  const bodyColors=useMemo(()=>SHIRT_COLORS.map(hex=>new Color(hex)),[]);
  const phoneColors=useMemo(()=>PHONE_COLORS.map(hex=>new Color(hex)),[]);
  const sceneTint=useMemo(()=>new Color(),[]);
  const phoneMembers=useMemo(()=>members.filter((_,i)=>i%5===0),[members]);
  const clock=useRef(0),budget=useRef(0),lastWaveAnimation=useRef(false),lastPhoneAnimation=useRef(false);
  const wave=useRef({...INITIAL_ARENA_WAVE_V1033});

  useLayoutEffect(()=>{
    for(let i=0;i<count;i++){
      const m=members[i];
      dummy.position.set(m.x,m.y+m.height*.43,m.z);
      dummy.rotation.set(0,Math.atan2(-m.x,-m.z),0);
      dummy.scale.set(.20,m.height*.75,.12);
      dummy.updateMatrix();bodies.current?.setMatrixAt(i,dummy.matrix);
      bodies.current?.setColorAt(i,bodyColors[m.hue]);
      dummy.position.set(m.x,m.y+m.height*.89,m.z);
      dummy.rotation.set(0,0,0);dummy.scale.set(.102,.107,.103);
      dummy.updateMatrix();heads.current?.setMatrixAt(i,dummy.matrix);
    }
    for(let i=0;i<phoneMembers.length;i++){
      const m=phoneMembers[i];
      dummy.position.set(m.x+.17,m.y+m.height*(m.armRaised?1.39:1.12),m.z);
      dummy.rotation.set(0,Math.atan2(-m.x,-m.z),0);
      dummy.scale.set(.095,.055,.014);
      dummy.updateMatrix();phones.current?.setMatrixAt(i,dummy.matrix);
      phones.current?.setColorAt(i,phoneColors[i%phoneColors.length]);
    }
    for(const mesh of [bodies.current,heads.current,phones.current]){
      if(!mesh)continue;
      mesh.instanceMatrix.needsUpdate=true;
      if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
      mesh.computeBoundingSphere();
    }
    lastWaveAnimation.current=false;lastPhoneAnimation.current=false;
  },[count,members,phoneMembers,dummy,bodyColors,phoneColors]);

  useFrame((_,delta)=>{
    if(!enabled||!crowd.current)return;
    const dt=Number.isFinite(delta)?Math.max(0,Math.min(.1,delta)):0;
    const active=playing&&!reducedMotion&&reactive;
    clock.current+=active?dt:0;
    const bass=active?Math.min(1,Math.max(0,audio.bass??0)):0;
    const hookCue=planArenaTimelineV1035({enabled:hookCueEnabled&&fullSongDirectorEnabled,
      playing,reducedMotion,reactive,progressMs,durationMs,section,energy:audio.energyEnvelope,intensity:showIntensity});
    wave.current=stepArenaWaveV1033(wave.current,dt,{
      enabled:wavesEnabled,playing,reducedMotion,reactive,beat:audio.beat,
      beatStrength:audio.beatStrength,bass:audio.bass,
    });
    crowd.current.rotation.y=active?Math.sin(clock.current*.34)*.006:0;
    if(pulseMaterial.current){
      const target=active ? .36+bass*.24 : .3;
      pulseMaterial.current.opacity+=(target-pulseMaterial.current.opacity)*Math.min(1,dt*5);
    }
    const animateWave=active&&(wavesEnabled||hookCue.crowdEnergy>.02);
    const animatePhones=active&&phoneSyncEnabled;
    const audienceOrchestra=animatePhones&&audienceCueV1044?.active===true;
    if(!animateWave&&!animatePhones&&!lastWaveAnimation.current&&!lastPhoneAnimation.current)return;
    budget.current+=dt;
    if(budget.current<(tier==='low' ? .12 : .066)&&active)return;
    budget.current=0;
    const t=clock.current;
    const waveAge=animateWave?wave.current.age:-1;
    if(animateWave||lastWaveAnimation.current){
      for(let i=0;i<count;i++){
        const m=members[i];
        const crest=animateWave?sampleArenaCrowdWaveV1033(m.x,m.z,waveAge):0;
        const sway=animateWave ? .023*Math.sin(t*1.9+i*.47)*(.28+.72*bass) : 0;
        const hookRise=hookCueEnabled?sampleArenaCrowdHookV1035(hookCue,Math.atan2(m.z,m.x),t):0;
        const rise=crest*.20+hookRise;
        dummy.position.set(m.x+sway,m.y+m.height*.43+rise,m.z);
        dummy.rotation.set(0,Math.atan2(-m.x,-m.z),0);
        dummy.scale.set(.20,m.height*.75,.12);
        dummy.updateMatrix();bodies.current?.setMatrixAt(i,dummy.matrix);
        dummy.position.set(m.x+sway,m.y+m.height*.89+rise,m.z);
        dummy.rotation.set(0,0,0);dummy.scale.set(.102,.107,.103);
        dummy.updateMatrix();heads.current?.setMatrixAt(i,dummy.matrix);
      }
      if(bodies.current)bodies.current.instanceMatrix.needsUpdate=true;
      if(heads.current)heads.current.instanceMatrix.needsUpdate=true;
    }
    if(animatePhones||lastPhoneAnimation.current||animateWave){
      if(audienceOrchestra){
        const [r,g,b]=audienceCueV1044!.color;sceneTint.setRGB(r,g,b);
      }
      for(let i=0;i<phoneMembers.length;i++){
        const m=phoneMembers[i];
        const crest=animateWave?sampleArenaCrowdWaveV1033(m.x,m.z,waveAge):0;
        const angle=Math.atan2(m.z,m.x);
        const original=animatePhones?sampleArenaPhoneV1033(angle,t,phoneMode,audio.beat?audio.beatStrength??0:0,crest):.45;
        const light=audienceOrchestra?sampleArenaAudienceV1044(audienceCueV1044,angle,t,original):original;
        tint.copy(phoneColors[i%phoneColors.length]);
        if(audienceOrchestra)tint.lerp(sceneTint,Math.min(.55,audienceCueV1044!.gain*.65));
        phones.current?.setColorAt(i,tint.multiplyScalar(Math.min(1,light*(1+.20*hookCue.crowdEnergy))));
        const hookRise=hookCueEnabled?sampleArenaCrowdHookV1035(hookCue,angle,t):0;
        dummy.position.set(m.x+.17,m.y+m.height*(m.armRaised?1.39:1.12)+crest*.20+hookRise,m.z);
        dummy.rotation.set(0,Math.atan2(-m.x,-m.z),0);
        dummy.scale.set(.095,.055,.014);dummy.updateMatrix();
        phones.current?.setMatrixAt(i,dummy.matrix);
      }
      if(phones.current){
        if(phones.current.instanceColor)phones.current.instanceColor.needsUpdate=true;
        phones.current.instanceMatrix.needsUpdate=true;
      }
    }
    lastWaveAnimation.current=animateWave;
    lastPhoneAnimation.current=animatePhones;
  });
  if(!enabled||!count)return null;
  return <group name="v1032-arena-audience">
    <mesh position={[0,-2.12,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[4.05,tier==='high'?7.5:tier==='balanced'?6.65:5.45,96]}/>
      <meshStandardMaterial color="#0d1428" metalness={.38} roughness={.82}/>
    </mesh>
    <group ref={crowd}>
      <instancedMesh ref={bodies} args={[undefined,undefined,count]} frustumCulled={false} name="v1032-audience-bodies">
        <boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ffffff" roughness={.93}/>
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined,undefined,count]} frustumCulled={false} name="v1032-audience-heads">
        <sphereGeometry args={[1,6,5]}/><meshStandardMaterial color="#656a88" roughness={.97}/>
      </instancedMesh>
      {!!phoneMembers.length&&<instancedMesh ref={phones} args={[undefined,undefined,phoneMembers.length]} frustumCulled={false} name="v1032-audience-phone-lights">
        <planeGeometry args={[1,1]}/><meshBasicMaterial ref={pulseMaterial} transparent opacity={.38} toneMapped={false} depthWrite={false} side={2}/>
      </instancedMesh>}
    </group>
  </group>;
}
