'use client';
import {useCallback,useRef} from 'react';
import {Bone,Euler,MathUtils,Object3D,Quaternion} from 'three';
import type {AudioFeatures} from '@/types/audio';
import type {GenreMotionCueV471} from '@/components/visualizer/genreChoreographyV471';
import type {VocalDanceAccentV472} from '@/components/visualizer/vocalAwareChoreographyV472';

type Joint='spine'|'chest'|'hips'|'leftArm'|'rightArm'|'leftKnee'|'rightKnee';
export type AudioMotionConfig={bassMultiplier?:number;trebleMultiplier?:number;intensity?:number;protectFootIK?:boolean};
type Entry={bone:Bone;before:Quaternion;applied:Quaternion;offset:Quaternion;used:boolean};
const bounded=(n:number)=>Number.isFinite(n)?MathUtils.clamp(n,0,1):0;
const findJoint=(name:string):Joint|null=>{
 const s=name.toLowerCase().replace(/[^a-z0-9]/g,'');
 if(/(?:spine2|chest|upperchest)$/.test(s))return 'chest';
 if(/spine(?:1)?$/.test(s))return 'spine';
 if(/(?:hips|pelvis)$/.test(s))return 'hips';
 if(/(?:leftarm|leftupperarm|lupperarm)$/.test(s))return 'leftArm';
 if(/(?:rightarm|rightupperarm|rupperarm)$/.test(s))return 'rightArm';
 if(/(?:leftleg|leftlowerleg|lcalf)$/.test(s))return 'leftKnee';
 if(/(?:rightleg|rightlowerleg|rcalf)$/.test(s))return 'rightKnee';
 return null;
};
/** Additive, non-destructive bone accents applied AFTER the normal animation pass.
 * Never changes animation tracks, mixer weights or face/mouth bones. */
export function useAudioMotionEngine(config:AudioMotionConfig={}){
 const joints=useRef<Partial<Record<Joint,Entry>>>({});
 const phase=useRef(0);
 const euler=useRef(new Euler());
 const smoothed=useRef({bass:0,mid:0,treble:0});
 const vocalSmoothed=useRef({head:0,chest:0,arms:0,side:0});
 const bindBones=useCallback((rig:Object3D)=>{
   const found:Partial<Record<Joint,Entry>>={};
   rig.traverse(node=>{
    if(!(node as Bone).isBone)return;
    const key=findJoint(node.name);
    if(key&&!found[key]){
      const bone=node as Bone;
      found[key]={bone,before:new Quaternion(),applied:new Quaternion(),offset:new Quaternion(),used:false};
    }
   });
   joints.current=found;
   smoothed.current={bass:0,mid:0,treble:0};vocalSmoothed.current={head:0,chest:0,arms:0,side:0};phase.current=0;
 },[]);
 const updateMotion=useCallback((audio:Pick<AudioFeatures,'bass'|'mids'|'highs'|'kickAccentIntensity'>,delta:number,enabled:boolean,genreMotion?:GenreMotionCueV471|null,vocalCue?:VocalDanceAccentV472|null)=>{
   const dt=MathUtils.clamp(Number.isFinite(delta)?delta:0,0,.1);
   phase.current+=dt;
   const gain=MathUtils.clamp(config.intensity??.55,0,1.5);
   const mix=1-Math.exp(-dt*11);
   const target=enabled?{bass:bounded(audio.bass),mid:bounded(audio.mids),treble:bounded(audio.highs)}:{bass:0,mid:0,treble:0};
   const smooth=smoothed.current;
   smooth.bass+=(target.bass-smooth.bass)*mix;
   smooth.mid+=(target.mid-smooth.mid)*mix;
   smooth.treble+=(target.treble-smooth.treble)*mix;
   const targetVocal=enabled&&vocalCue?.active?vocalCue:null;
   const vocal=vocalSmoothed.current;
   const smoothing=1-Math.exp(-dt*16);
   for(const key of ['head','chest','arms','side'] as const){
     const next=targetVocal?.[key]??0;
     vocal[key]+=(next-vocal[key])*smoothing;
   }
   // Genre cues are bounded additive offsets; base animations and face rigs remain authoritative.
   const genreWeight=enabled?MathUtils.clamp(genreMotion?.weight??0,0,1):0;
   const motionGain=(key:'head'|'arms'|'hips'|'legs')=>1+((genreMotion?.[key]??1)-1)*genreWeight;
   const kick=bounded(audio.kickAccentIntensity??0)*genreWeight;
   const rhythm=Math.sin(phase.current*3.1)*.012;
   const rap=genreMotion?.family==='rap'?genreWeight:0;
   const rock=genreMotion?.family==='rock'?genreWeight:0;
   const angles:Partial<Record<Joint,[number,number,number]>>={
    spine:[(smooth.bass*.085+rhythm+kick*.015+vocal.head)*gain*motionGain('head')*(config.bassMultiplier??1),0,Math.sin(phase.current*1.9)*smooth.mid*.018*gain],
    chest:[(smooth.bass*.045+kick*(.012+.006*rock)+vocal.chest)*gain,Math.sin(phase.current*2.8)*smooth.mid*(.043+.008*rap)*gain,0],
    leftArm:[0,0,(smooth.treble*.075+smooth.mid*.035+kick*.015*rap+vocal.arms*Math.max(0,vocal.side))*gain*motionGain('arms')*(config.trebleMultiplier??1)],
    rightArm:[0,0,-(smooth.treble*.075+smooth.mid*.035+kick*.015*rap+vocal.arms*Math.max(0,-vocal.side))*gain*motionGain('arms')*(config.trebleMultiplier??1)],
    // Foot IK/contact locking owns the legs and pelvis when enabled.
    ...(!config.protectFootIK?{
      hips:[smooth.bass*.028*gain*motionGain('hips'),0,0] as [number,number,number],
      leftKnee:[smooth.bass*.03*gain*motionGain('legs'),0,0] as [number,number,number],
      rightKnee:[smooth.bass*.03*gain*motionGain('legs'),0,0] as [number,number,number],
    }:{})
   };
   for(const [name,entry] of Object.entries(joints.current) as [Joint,Entry][]) {
     // If the animation mixer has not rewritten the pose since the last frame,
     // restore the captured base to prevent accumulating additive rotations.
     if(entry.used&&entry.bone.quaternion.angleTo(entry.applied)<.001)
       entry.bone.quaternion.copy(entry.before);
     entry.used=false;
     if(!enabled||gain===0||!angles[name])continue;
     const [x,y,z]=angles[name]!;
     entry.before.copy(entry.bone.quaternion);
     entry.offset.setFromEuler(euler.current.set(x,y,z,'XYZ'));
     entry.bone.quaternion.multiply(entry.offset).normalize();
     entry.applied.copy(entry.bone.quaternion);entry.used=true;
   }
 },[config.bassMultiplier,config.trebleMultiplier,config.intensity,config.protectFootIK]);
 return {bindBones,updateMotion};
}
