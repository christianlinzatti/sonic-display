import {AnimationClip, Quaternion, QuaternionKeyframeTrack} from "three";
/** Conservative rotation-only motion style adaptation for humanoid rigs. */
export type MotionStyle={amplitude:number;upperBody:number;lowerBody:number};
export const DEFAULT_STYLE:MotionStyle={amplitude:1,upperBody:1,lowerBody:1};
export function clampStyle(raw:Partial<MotionStyle>|null|undefined):MotionStyle {
 const clamp=(v:unknown)=>typeof v==="number"&&Number.isFinite(v)?Math.max(0.5,Math.min(1.5,v)):1;
 return {amplitude:clamp(raw?.amplitude),upperBody:clamp(raw?.upperBody),lowerBody:clamp(raw?.lowerBody)};
}
export function adaptMotionStyle(clips:readonly AnimationClip[],style:MotionStyle,rest:Map<string,Quaternion>):AnimationClip[]{
 const profile=clampStyle(style);
 return clips.map(source=>{const clip=source.clone();clip.tracks=clip.tracks.map(track=>{
  if(!(track instanceof QuaternionKeyframeTrack))return track;
  const name=track.name.replace(/\.quaternion$/,"");const base=rest.get(name);if(!base)return track;
  const lower=/leg|thigh|foot|toe|calf|shin|hip|pelvis/i.test(name);
  const intensity=Math.max(0.4,Math.min(1.6,profile.amplitude*(lower?profile.lowerBody:profile.upperBody)));
  const values=new Float32Array(track.values.length);const pose=new Quaternion(),delta=new Quaternion(),identity=new Quaternion();
  for(let i=0;i<values.length;i+=4){pose.set(track.values[i],track.values[i+1],track.values[i+2],track.values[i+3]).normalize();delta.copy(base).invert().multiply(pose).normalize();
   // SLERP is safe for dampening; extrapolation is deliberately not attempted.
   identity.identity().slerp(delta,Math.min(1.25,intensity));pose.copy(base).multiply(identity).normalize();values.set([pose.x,pose.y,pose.z,pose.w],i);
  }return new QuaternionKeyframeTrack(track.name,track.times.slice(),values);
 });return clip;});
}
