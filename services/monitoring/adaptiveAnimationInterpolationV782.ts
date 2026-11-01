/** V782: fixed-cost, zero per-frame allocation interpolation of sampled GLB node transforms.
 * This is opt-in to the local concert benchmark; the production avatar director is unchanged.
 * Mixer evaluation occurs only at sample boundaries (stride=2/3), while the cached
 * poses are interpolated every rendered frame. All mesh morph weights are included.
 * Input uses structural Three-like interfaces for dependency-free regression tests. */
export type Vec3V782={x:number;y:number;z:number;set(x:number,y:number,z:number):unknown};
export type QuatV782={x:number;y:number;z:number;w:number;set(x:number,y:number,z:number,w:number):unknown};
export type PoseNodeV782={position:Vec3V782;quaternion:QuatV782;scale:Vec3V782;morphTargetInfluences?:number[]};
export type PoseInterpolationV782={sample:(frame:number)=>void;reset:()=>void;stats:()=>{mixerSamples:number;appliedFrames:number;trackedNodes:number;trackedMorphs:number}};
const POSE_WIDTH=10;
const clamp01=(v:number)=>Math.max(0,Math.min(1,v));
function write(nodes:readonly PoseNodeV782[],dst:Float32Array,morphs:Float32Array){
 let i=0,m=0;
 for(const node of nodes){
  const p=node.position,q=node.quaternion,s=node.scale;
  dst.set([p.x,p.y,p.z,q.x,q.y,q.z,q.w,s.x,s.y,s.z],i);i+=POSE_WIDTH;
  if(node.morphTargetInfluences)for(const v of node.morphTargetInfluences)morphs[m++]=v;
 }
}
function apply(nodes:readonly PoseNodeV782[],a:Float32Array,b:Float32Array,ma:Float32Array,mb:Float32Array,t:number){
 t=clamp01(t);let i=0,m=0;
 for(const node of nodes){
  node.position.set(a[i]+(b[i]-a[i])*t,a[i+1]+(b[i+1]-a[i+1])*t,a[i+2]+(b[i+2]-a[i+2])*t);
  // Shortest-path unit quaternion SLERP, with normalized linear fallback when near-aligned.
  let bx=b[i+3],by=b[i+4],bz=b[i+5],bw=b[i+6];
  const ax=a[i+3],ay=a[i+4],az=a[i+5],aw=a[i+6];
  let dot=ax*bx+ay*by+az*bz+aw*bw;
  if(dot<0){dot=-dot;bx=-bx;by=-by;bz=-bz;bw=-bw;}
  let k0=1-t,k1=t;
  if(dot<.9995){const theta=Math.acos(Math.min(1,dot)),sin=Math.sin(theta);
   if(sin>1e-8){k0=Math.sin((1-t)*theta)/sin;k1=Math.sin(t*theta)/sin;}
  }
  let x=ax*k0+bx*k1,y=ay*k0+by*k1,z=az*k0+bz*k1,w=aw*k0+bw*k1;
  const norm=Math.hypot(x,y,z,w);
  if(norm>1e-8){x/=norm;y/=norm;z/=norm;w/=norm;}else{x=0;y=0;z=0;w=1;}
  node.quaternion.set(x,y,z,w);
  node.scale.set(a[i+7]+(b[i+7]-a[i+7])*t,a[i+8]+(b[i+8]-a[i+8])*t,a[i+9]+(b[i+9]-a[i+9])*t);i+=POSE_WIDTH;
  if(node.morphTargetInfluences)for(let j=0;j<node.morphTargetInfluences.length;j++,m++){
   node.morphTargetInfluences[j]=ma[m]+(mb[m]-ma[m])*t;
  }
 }
}
/** The mixer is evaluated for the NEXT key pose only at cadence boundaries; no
 * interpolation frame invokes it. Sampling is independent of real-time RAF delta. */
export function createPoseInterpolationV782(nodes:readonly PoseNodeV782[],setTime:(seconds:number)=>void,stride:number):PoseInterpolationV782{
 if(!Number.isInteger(stride)||stride<2||stride>8||!nodes.length)throw Error('V782 benötigt 2–8 Frames Abstand und GLB-Knoten');
 const morphCount=nodes.reduce((n,x)=>n+(x.morphTargetInfluences?.length??0),0);
 const a=new Float32Array(nodes.length*POSE_WIDTH),b=new Float32Array(a.length);
 const ma=new Float32Array(morphCount),mb=new Float32Array(morphCount);
 let start=-1,last=-1,mixerSamples=0,appliedFrames=0;
 const key=(frame:number,pose:Float32Array,morph:Float32Array)=>{
  setTime(frame/60);mixerSamples++;write(nodes,pose,morph);
 };
 const reset=()=>{start=-1;last=-1;};
 const sample=(frame:number)=>{
  if(!Number.isInteger(frame)||frame<0)throw Error('Ungültiger logischer Animationsframe');
  if(start<0||frame<last){
   start=Math.floor(frame/stride)*stride;
   key(start,a,ma);key(start+stride,b,mb);
  }else if(frame>=start+stride){
   if(frame>=start+stride*2){
    start=Math.floor(frame/stride)*stride;
    key(start,a,ma);key(start+stride,b,mb);
   }else{
    a.set(b);ma.set(mb);start+=stride;key(start+stride,b,mb);
   }
  }
  apply(nodes,a,b,ma,mb,(frame-start)/stride);appliedFrames++;last=frame;
 };
 return {sample,reset,stats:()=>({mixerSamples,appliedFrames,trackedNodes:nodes.length,trackedMorphs:morphCount})};
}
