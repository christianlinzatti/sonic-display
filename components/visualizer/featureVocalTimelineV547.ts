import type {VocalTimeSegmentV496} from "./vocalTimeDirectorV496";

/** Lightweight DOM-only visual lanes; no WebGL cameras, animation mixers or timers. */
export type FeatureLaneItemV547={id:number;slot:number;left:number;width:number;role:string;isAdlib:boolean;overlap:boolean};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
export function projectFeatureVocalTimelineV547(segments:readonly VocalTimeSegmentV496[],durationMs:number,count=4):FeatureLaneItemV547[]{
 if(!Number.isFinite(durationMs)||durationMs<=0)return [];
 const n=clamp(Math.trunc(Number.isFinite(count)?count:4),1,4);
 const out:FeatureLaneItemV547[]=[];
 const valid=segments.slice(0,120).filter(s=>Number.isFinite(s.startMs)&&Number.isFinite(s.endMs)&&
   s.startMs>=0&&s.endMs>s.startMs&&s.endMs<=durationMs);
 for(let id=0;id<valid.length;id++){
  const s=valid[id];
  const slots=s.singerSlotsV547?.length?s.singerSlotsV547:
   s.style==="hook"?[0,1,2,3]:s.style==="duet"?[s.leadSlot,s.partnerSlot]:[s.leadSlot];
  const overlap=s.roleV547!=="adlib"&&valid.some((o,j)=>j!==id&&o.roleV547!=="adlib"&&
    o.startMs<s.endMs&&o.endMs>s.startMs);
  for(const slot of [...new Set(slots)]){
   if(!Number.isInteger(slot)||slot<0||slot>=n)continue;
   out.push({id,slot,left:clamp(100*s.startMs/durationMs,0,100),
    width:Math.max(.25,clamp(100*s.endMs/durationMs,0,100)-clamp(100*s.startMs/durationMs,0,100)),
    role:s.roleV547??s.style,isAdlib:s.roleV547==="adlib",overlap});
  }
 }
 return out;
}
export function snapVocalTimestampV547(ms:number,durationMs:number,stepMs=10):number{
 if(!Number.isFinite(ms)||!Number.isFinite(durationMs)||durationMs<=0)return 0;
 const step=Number.isFinite(stepMs)&&stepMs>=1?Math.trunc(stepMs):10;
 return clamp(Math.round(ms/step)*step,0,Math.min(durationMs,4*60*60*1000));
}
