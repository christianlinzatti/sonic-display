/** V507 — measured, model-scoped body envelopes for existing V506 safety.
 * No invented joint lengths: bone measurements require valid landmarks; mesh
 * fallback is explicitly coarse. Units are model/rest-pose units after scale.
 * Never writes into model bones, animations, root transforms or storage.
 */
export type PointV507=readonly [number,number,number];
export type BodyLandmarkV507='head'|'leftShoulder'|'rightShoulder'|'leftElbow'|'rightElbow'|'leftWrist'|'rightWrist'|'leftHip'|'rightHip'|'leftKnee'|'rightKnee'|'leftFoot'|'rightFoot';
export type LandmarkMapV507=Partial<Record<BodyLandmarkV507,PointV507>>;
export interface BodyProfileV507 {
  source:'skeletal'|'bounds'|'fallback';confidence:number;
  height:number|null;shoulderWidth:number|null;armLength:number|null;legLength:number|null;
  torsoRadius:number;armReach:number;
}
export interface BodyProfileSampleV507 { landmarks:LandmarkMapV507;
  bounds?:{height:number;width:number;depth:number}|null; scale?:number;
}
const cl=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
const valid=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
const len=(a:PointV507|undefined,b:PointV507|undefined,scale:number):number|null=>{
  if(!a||!b||a.length!==3||b.length!==3||![...a,...b].every(valid))return null;
  const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])*scale;
  return d>=.045&&d<=4.5?d:null;
};
const range=(v:number|null,lo:number,hi:number)=>v!==null&&Number.isFinite(v)&&v>=lo&&v<=hi?v:null;
const average=(a:number|null,b:number|null)=>a!==null&&b!==null?(a+b)/2:a??b;
const limb=(landmarks:LandmarkMapV507,prefix:'left'|'right',parts:readonly ['Shoulder','Elbow','Wrist']|readonly ['Hip','Knee','Foot'],scale:number)=>{
  const one=len(landmarks[`${prefix}${parts[0]}` as BodyLandmarkV507],landmarks[`${prefix}${parts[1]}` as BodyLandmarkV507],scale);
  const two=len(landmarks[`${prefix}${parts[1]}` as BodyLandmarkV507],landmarks[`${prefix}${parts[2]}` as BodyLandmarkV507],scale);
  return one!==null&&two!==null?one+two:null;
};
/** Conservative stage units are the same units used by V506. */
export function profileAvatarBodyV507(input:BodyProfileSampleV507):BodyProfileV507 {
 const scale=valid(input.scale)&&Number(input.scale)>0?cl(Number(input.scale),.05,10):1;
 const l=input.landmarks??{};
 const shoulder=range(len(l.leftShoulder,l.rightShoulder,scale),.16,1.6);
 const arms=range(average(limb(l,'left',['Shoulder','Elbow','Wrist'],scale),limb(l,'right',['Shoulder','Elbow','Wrist'],scale)),.22,2.3);
 const legs=range(average(limb(l,'left',['Hip','Knee','Foot'],scale),limb(l,'right',['Hip','Knee','Foot'],scale)),.24,2.6);
 const ankleY=average(l.leftFoot?.[1]??null,l.rightFoot?.[1]??null);
 const boneHeight=l.head&&ankleY!==null&&valid(l.head[1])&&valid(ankleY)?range(Math.abs(l.head[1]-ankleY)*scale,.6,3.8):null;
 const box=input.bounds;
 const boxHeight=box&&valid(box.height)?range(box.height*scale,.55,4):null;
 const height=boneHeight??boxHeight;
 const skeleton=shoulder!==null&&(arms!==null||legs!==null);
 const source:BodyProfileV507['source']=skeleton?'skeletal':height!==null?'bounds':'fallback';
 const ratio=height!==null?cl(height/1.75,.7,1.38):1;
 // A T-pose mesh width includes straightened arms and must NOT be taken as torso width.
 const coarseWidth=box&&valid(box.width)&&box.width>0?cl(box.width*scale*.31,.31,.65):null;
 const width=shoulder??(source==='bounds'?coarseWidth:null);
 // Keep V506 collision radii in its tested [0.30,0.58] operating band.
 const torsoRadius=cl(.42*(width!==null?cl(width/.46,.78,1.32):ratio),.30,.58);
 const armReach=cl(.12*(arms!==null?cl(arms/.73,.7,1.55):ratio),.085,.19);
 return {source,confidence:skeleton?(legs!==null&&boneHeight!==null?1:.86):source==='bounds'?.42:0,
   height,shoulderWidth:shoulder,armLength:arms,legLength:legs,torsoRadius,armReach};
}
export interface BodyRegistryV507 {
  set(slot:number,identity:string,profile:BodyProfileV507):void;
  get(slot:number):BodyProfileV507|undefined;
  clear(slot:number,identity:string):void;
}
/** A stage-local, four-slot registry. No global data and no cross-stage bleed. */
export function createBodyRegistryV507():BodyRegistryV507 {
 const slots=new Map<number,{identity:string;profile:BodyProfileV507}>();
 const safe=(slot:number)=>Number.isInteger(slot)&&slot>=0&&slot<4;
 return {set(slot,identity,profile){if(safe(slot)&&identity&&profile.source!=='fallback')slots.set(slot,{identity,profile});},
  get(slot){return slots.get(slot)?.profile;},
  clear(slot,identity){if(slots.get(slot)?.identity===identity)slots.delete(slot);}};
}
