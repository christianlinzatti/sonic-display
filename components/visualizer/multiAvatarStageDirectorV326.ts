/** V326: opt-in, deterministic three/four-dancer *stage-space* choreography.
 * Each dancer owns its GLB mixer/IK. No skeleton/clip modification or physics claims. */
export type GroupFormationV326='line'|'wide'|'arc'|'stagger';
export type GroupPointV326=[number,number,number];
export type GroupCueV326={id:string;at:number;formation:GroupFormationV326;focus:number;drop:boolean;transition:number;positions:GroupPointV326[]};
export type GroupStudioV326={enabled:boolean;count:3|4;songSync:boolean;trackId:string;bpm:number;snap:'off'|'beat'|'bar';minSpacing:number;modelIds:string[];cues:GroupCueV326[]};
export type GroupPoseV326={positions:GroupPointV326[];focus:number;drop:boolean;formation:GroupFormationV326;cueId:string;blend:number;distance:number;spacingAdjusted:boolean};
export const GROUP_KEY_V326='sonic-multi-avatar-stage-v326';
export const GROUP_EVENT_V326='sonic:multi-avatar-stage-v326';
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));
const finite=(v:unknown,d:number)=>typeof v==='number'&&Number.isFinite(v)?v:d;
const round=(x:number)=>Math.round(x*1000)/1000;
const str=(v:unknown,n=160)=>typeof v==='string'?v.slice(0,n):'';
const formation=(v:unknown):GroupFormationV326=>v==='wide'||v==='arc'||v==='stagger'?v:'line';
export function layoutV326(kind:GroupFormationV326,count:3|4):GroupPointV326[]{
 const width=kind==='wide'?3.55:kind==='line'?2.3:2.7;
 return Array.from({length:count},(_,i)=>{
  const x=-width/2+i*width/(count-1);
  const z=kind==='arc'?-.65+Math.abs((i-(count-1)/2)/((count-1)/2))*.65:kind==='stagger'?(i%2===0?-.58:.38):0;
  return [round(x),0,round(z)];
 });
}
const defaults=(id:string,at:number,kind:GroupFormationV326,focus:number,drop:boolean):GroupCueV326=>({id,at,formation:kind,focus,drop,transition:.8,positions:layoutV326(kind,4)});
export const GROUP_DEFAULT_V326:GroupStudioV326={enabled:false,count:4,songSync:false,trackId:'',bpm:128,snap:'bar',minSpacing:1.05,modelIds:['','','',''],cues:[defaults('intro',0,'line',-1,false),defaults('solo',8,'stagger',0,false),defaults('drop',16,'wide',-1,true)]};
export function normalizeGroupV326(input:unknown):GroupStudioV326{
 const r=input&&typeof input==='object'&&!Array.isArray(input)?input as Partial<GroupStudioV326>:{};
 const count:3|4=r.count===3?3:4;
 const src=Array.isArray(r.cues)?r.cues:GROUP_DEFAULT_V326.cues;
 const cues=src.slice(0,64).map((raw,i)=>{
  const v=raw&&typeof raw==='object'?raw as Partial<GroupCueV326>:{};
  const kind=formation(v.formation);
  const base=layoutV326(kind,count);
  const positions=base.map((p,j):GroupPointV326=>{
   const q=Array.isArray(v.positions)&&Array.isArray(v.positions[j])?v.positions[j]:p;
   return [round(clamp(finite(q[0],p[0]),-4.5,4.5)),0,round(clamp(finite(q[2],p[2]),-2,2))];
  });
  return {id:str(v.id,40)||`cue-${i}`,at:round(clamp(finite(v.at,0),0,3600)),formation:kind,focus:typeof v.focus==='number'&&Number.isInteger(v.focus)&&v.focus>=0&&v.focus<count?v.focus:-1,
   drop:v.drop===true,transition:round(clamp(finite(v.transition,.8),0,8)),positions};
 }).sort((a,b)=>a.at-b.at);
 const names=new Set<string>();for(let i=0;i<cues.length;i++){let name=cues[i].id;while(names.has(name))name=`cue-${i}-${names.size}`;cues[i].id=name;names.add(name);}
 return {enabled:r.enabled===true,count,songSync:r.songSync===true,trackId:str(r.trackId,200),bpm:round(clamp(finite(r.bpm,128),40,240)),snap:r.snap==='beat'?'beat':r.snap==='off'?'off':'bar',
  minSpacing:round(clamp(finite(r.minSpacing,1.05),.7,2.3)),modelIds:Array.from({length:4},(_,i)=>str(Array.isArray(r.modelIds)?r.modelIds[i]:'',200)),cues};
}
export function canRunGroupV326(s:GroupStudioV326,trackId?:string|null):boolean{
 return s.enabled&&s.cues.length>0&&(!s.songSync||!!s.trackId&&s.trackId===trackId);
}
/** Bounded lane-preserving spacing of stage roots; no body collision avoidance. */
export function protectGroupSpacingV326(points:readonly GroupPointV326[],minimum:number):{points:GroupPointV326[];adjusted:boolean;distance:number}{
 const n=points.length,gap=clamp(finite(minimum,1.05),.7,2.3);
 const xs=points.map((p,i)=>clamp(finite(p[0],-2+i),-4.5,4.5));
 for(let i=1;i<n;i++)xs[i]=Math.max(xs[i],xs[i-1]+gap);
 if(xs[n-1]>4.5){const shift=xs[n-1]-4.5;for(let i=0;i<n;i++)xs[i]-=shift;}
 if(xs[0]<-4.5){const shift=-4.5-xs[0];for(let i=0;i<n;i++)xs[i]+=shift;}
 // Preserve the author's ensemble centre when resolving tight rows, rather than
 // shifting the whole line to the right as a side effect of left-to-right separation.
 if(n>1){
  const desired=(finite(points[0][0],xs[0])+finite(points[n-1][0],xs[n-1]))/2;
  const actual=(xs[0]+xs[n-1])/2;
  const delta=clamp(desired-actual,-4.5-xs[0],4.5-xs[n-1]);
  for(let i=0;i<n;i++)xs[i]+=delta;
 }
 const result:GroupPointV326[]=points.map((p,i)=>[round(xs[i]),0,round(clamp(finite(p[2],0),-2,2))]);
 return {points:result,adjusted:result.some((p,i)=>Math.abs(p[0]-points[i][0])>.001),distance:result.reduce((d,p,i)=>i?Math.min(d,Math.hypot(p[0]-result[i-1][0],p[2]-result[i-1][2])):d,Infinity)};
}
export function evaluateGroupV326(s:GroupStudioV326,time:number):GroupPoseV326|null{
 if(!s.cues.length)return null;
 const at=clamp(finite(time,0),0,3600);
 let index=0;for(let i=1;i<s.cues.length&&s.cues[i].at<=at;i++)index=i;
 const current=s.cues[index],previous=s.cues[Math.max(0,index-1)];
 const blend=index===0||current.transition<=0?1:clamp((at-current.at)/current.transition,0,1);
 const b=blend*blend*(3-2*blend);
 const positions=Array.from({length:s.count},(_,i):GroupPointV326=>[
  previous.positions[i][0]+(current.positions[i][0]-previous.positions[i][0])*b,0,
  previous.positions[i][2]+(current.positions[i][2]-previous.positions[i][2])*b]);
 const safe=protectGroupSpacingV326(positions,s.minSpacing);
 return {positions:safe.points,spacingAdjusted:safe.adjusted,distance:safe.distance,focus:current.focus,drop:current.drop,formation:current.formation,cueId:current.id,blend};
}
export function updateGroupCueV326(s:GroupStudioV326,id:string,patch:Partial<GroupCueV326>):GroupStudioV326{
 return normalizeGroupV326({...s,cues:s.cues.map(x=>x.id===id?{...x,...patch,id:x.id}:x)});
}
export function readGroupV326():GroupStudioV326{
 if(typeof window==='undefined')return normalizeGroupV326(GROUP_DEFAULT_V326);
 try{return normalizeGroupV326(JSON.parse(window.localStorage.getItem(GROUP_KEY_V326)||'null'));}catch{return normalizeGroupV326(GROUP_DEFAULT_V326);}
}
export function writeGroupV326(value:unknown):GroupStudioV326{
 const clean=normalizeGroupV326(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(GROUP_KEY_V326,JSON.stringify(clean));}catch{/* quota/private */}
  window.dispatchEvent(new Event(GROUP_EVENT_V326));
 }
 return clean;
}
