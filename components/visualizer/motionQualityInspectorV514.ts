/** V514 — preview-only, read-only conservative kinematic quality observations.
 * Sampling is driven by the EXISTING V513 bone cadence. All quantities are
 * heuristic indicators (not proof of bad motion, joint damage or foot contact).
 */
import type {BodyLandmarkV507} from './avatarBodyAwarenessV507';
import type {MotionPointV508} from './animatedCollisionV508';
export type QualityJointV514=BodyLandmarkV507;
export interface MotionPoseV514 {
 at:number;
 joints:Partial<Record<QualityJointV514,MotionPointV508>>;
 floorY:number;
}
export type QualityKindV514='joint-angle'|'motion-jump'|'foot-slide'|'body-lean';
export interface QualityEventV514 {
 kind:QualityKindV514; at:number; slot:number; severity:number;
 location:MotionPointV508; label:string;
}
export interface QualityReportV514 {available:boolean;measured:number;events:readonly QualityEventV514[];}
const finite=(v:number)=>Number.isFinite(v)&&Math.abs(v)<10000;
const valid=(p:MotionPointV508|undefined):p is MotionPointV508=>!!p&&p.length===3&&p.every(finite);
const norm=(a:MotionPointV508,b:MotionPointV508)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
const sub=(a:MotionPointV508,b:MotionPointV508)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]] as const;
const mid=(a:MotionPointV508,b:MotionPointV508)=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2] as const;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
export function angleV514(a:MotionPointV508,b:MotionPointV508,c:MotionPointV508):number|null {
 if(!valid(a)||!valid(b)||!valid(c))return null;
 const ab=sub(a,b),cb=sub(c,b),x=Math.hypot(...ab),y=Math.hypot(...cb);
 if(x<.06||y<.06)return null;
 const cosine=clamp((ab[0]*cb[0]+ab[1]*cb[1]+ab[2]*cb[2])/(x*y),-1,1);
 return Math.acos(cosine)*180/Math.PI;
}
const maybe=(p:MotionPointV508|undefined)=>valid(p)?p:undefined;
/** Pass the preview clone's normalized floor (normally Y=0) and matching
 * timestamps; seek discontinuities MUST NOT be interpreted as velocity.
 * Invalid or absent points never yield synthetic warnings.
 */
export function inspectMotionPoseV514(slot:number,pose:MotionPoseV514|undefined,previous?:MotionPoseV514):QualityReportV514 {
 const none:QualityReportV514={available:false,measured:0,events:[]};
 if(!Number.isInteger(slot)||slot<0||slot>3||!pose||!finite(pose.at)||!finite(pose.floorY))return none;
 const j=pose.joints??{},events:QualityEventV514[]=[];
 const position=(key:QualityJointV514)=>maybe(j[key]);
 let measured=0;
 const add=(kind:QualityKindV514,label:string,location:MotionPointV508,severity:number)=>{
  if(valid(location)&&Number.isFinite(severity))events.push({kind,label,location,at:pose.at,slot,severity:clamp(severity,0,1)});
 };
 // 10–14 degree compressions are unusual but may be intentional breakdance poses.
 for(const side of ['left','right'] as const){
  for(const [first,hinge,last,min,description] of [
   ['Shoulder','Elbow','Wrist',14,'Ellbogen'],['Hip','Knee','Foot',18,'Knie'],
  ] as const){
   const a=position(`${side}${first}`),b=position(`${side}${hinge}`),c=position(`${side}${last}`);
   if(!a||!b||!c)continue;
   const angle=angleV514(a,b,c);
   if(angle===null)continue;
   measured++;
   if(angle<min)add('joint-angle',`${side==='left'?'Links':'Rechts'}: auffällige ${description}-Beugung (${angle.toFixed(0)}°)`,b,(min-angle)/min);
  }
 }
 const lS=position('leftShoulder'),rS=position('rightShoulder'),lH=position('leftHip'),rH=position('rightHip');
 if(lS&&rS&&lH&&rH){
  const shoulders=mid(lS,rS),hips=mid(lH,rH);
  const height=shoulders[1]-hips[1],lateral=Math.hypot(shoulders[0]-hips[0],shoulders[2]-hips[2]);
  if(height>.15){measured++;const ratio=lateral/height;
   if(ratio>1.1)add('body-lean',`Starke Oberkörperneigung (Verhältnis ${ratio.toFixed(1)})`,shoulders,(ratio-1.1)/1.2);
  }
 }
 // Acceleration/velocity estimates are valid only for consecutive, reasonably
 // spaced samples. Scrubbing, replay, paused frames and dropped frames do not count.
 const dt=previous?pose.at-previous.at:NaN;
 if(previous&&Number.isFinite(dt)&&dt>=.08&&dt<=.52){
  for(const key of ['head','leftWrist','rightWrist','leftHip','rightHip'] as const){
   const p=position(key),before=maybe(previous.joints?.[key]);
   if(!p||!before)continue;
   measured++;
   const speed=norm(p,before)/dt;
   const threshold=key==='head'?3.0:key.endsWith('Hip')?2.6:6.0;
   if(speed>threshold)add('motion-jump',`Auffälliger ${key==='head'?'Kopf-':key.endsWith('Hip')?'Hüft-':'Hand-'}Bewegungssprung (${speed.toFixed(1)} m/s)`,p,(speed-threshold)/threshold);
  }
  for(const key of ['leftFoot','rightFoot'] as const){
   const p=position(key),before=maybe(previous.joints?.[key]);
   if(!p||!before)continue;
   // Only flag near-floor horizontal travel when BOTH frames are near floor
   // with nearly unchanged height. Airborne foot movement is normal dance.
   measured++;
   const footHeight=Math.max(p[1]-pose.floorY,before[1]-previous.floorY);
   const vertical=Math.abs((p[1]-pose.floorY)-(before[1]-previous.floorY));
   const horizontal=Math.hypot(p[0]-before[0],p[2]-before[2]);
   if(footHeight>=-.03&&footHeight<=.105&&vertical<=.045&&horizontal>.1&&horizontal/dt>.55){
    add('foot-slide',`${key==='leftFoot'?'Linker':'Rechter'} Fuß: mögliche Bodenverschiebung (${horizontal.toFixed(2)} m)`,p,(horizontal/dt-.55)/1.2);
   }
  }
 }
 events.sort((a,b)=>b.severity-a.severity);
 return {available:measured>0,measured,events:events.slice(0,7)};
}
/** Bounded, chronological timeline. Coalesce recurring observations of the
 * same slot+kind within 0.26 s; no persistence or runaway state accumulation.
 */
export function recordQualityEventsV514(existing:readonly QualityEventV514[],incoming:readonly QualityEventV514[],limit=80):QualityEventV514[] {
 const max=Number.isFinite(limit)?Math.min(120,Math.max(1,Math.trunc(limit))):80;
 const events=existing.filter(e=>Number.isFinite(e.at)&&e.slot>=0&&e.slot<=3&&valid(e.location)&&Number.isFinite(e.severity)).slice(-max);
 for(const e of incoming){
  if(!Number.isFinite(e.at)||e.slot<0||e.slot>3||!valid(e.location)||!Number.isFinite(e.severity))continue;
  let previous=-1;
  for(let i=events.length-1;i>=0;i--)if(events[i].slot===e.slot&&events[i].kind===e.kind&&Math.abs(e.at-events[i].at)<.26){previous=i;break;}
  if(previous>=0){if(e.severity>=events[previous].severity)events[previous]=e;}
  else events.push(e);
 }
 return events.sort((a,b)=>a.at-b.at||a.slot-b.slot).slice(-max);
}
