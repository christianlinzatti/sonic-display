import type {MotionFeaturesV439} from "./glbMotionAnalyzerV439";
import type {InstalledCharacterMotion} from "./characterMotionLibrary";
export const MOTION_ANALYSIS_EVENT_V439="sonic:glb-motion-analysis-v439";
export const MOTION_ANALYSIS_KEY_V439="sonic.motion-analysis.v439";
export type MotionAnalysisEntryV439={url:string;at:number;status:"ok"|"unsupported"|"error";features?:MotionFeaturesV439};
export type MotionAnalysisCacheV439=Record<string,MotionAnalysisEntryV439>;
const own=(object:object,key:string)=>Object.prototype.hasOwnProperty.call(object,key);
const validId=(id:string)=>/^[\w-]{1,100}$/.test(id)&&id!=="__proto__"&&id!=="constructor"&&id!=="prototype";
const bound=(n:unknown)=>typeof n==="number"&&Number.isFinite(n)&&n>=0&&n<=4e12;
export function sanitizeMotionCacheV439(input:unknown):MotionAnalysisCacheV439{
  const result:MotionAnalysisCacheV439=Object.create(null);
  if(!input||typeof input!=="object"||Array.isArray(input))return result;
  for(const [id,value] of Object.entries(input).slice(-250)){
    if(!validId(id)||!value||typeof value!=="object"||Array.isArray(value))continue;
    const entry=value as MotionAnalysisEntryV439;
    if(typeof entry.url!=="string"||entry.url.length>2048||!/^\/[^/]|^https:\/\//.test(entry.url)||
      !bound(entry.at)||!["ok","unsupported","error"].includes(entry.status))continue;
    if(entry.status==="ok"){
      const f=entry.features;
      if(!f||!([f.arms,f.legs,f.torso,f.speed,f.energy,f.loopability,f.confidence].every(n=>bound(n)&&n<=1))||
        !bound(f.duration)||f.duration>360||typeof f.clipName!=="string"||f.clipName.length>100||
        !Number.isInteger(f.trackCount)||f.trackCount<1||f.trackCount>120||!Array.isArray(f.recommended)||
        f.recommended.length>7||!f.recommended.every(s=>["verse","hook","reply","duet","build","drop","break"].includes(s)))continue;
    }
    result[id]={url:entry.url,at:entry.at,status:entry.status,...entry.status==="ok"?{features:entry.features}: {}};
  }
  return result;
}
export function readMotionCacheV439():MotionAnalysisCacheV439{
  if(typeof window==="undefined")return Object.create(null);
  try{return sanitizeMotionCacheV439(JSON.parse(window.localStorage.getItem(MOTION_ANALYSIS_KEY_V439)||"null"));}
  catch{return Object.create(null);}
}
export function writeMotionCacheEntryV439(id:string,entry:MotionAnalysisEntryV439):void{
  if(typeof window==="undefined"||!validId(id))return;
  const next=sanitizeMotionCacheV439({...readMotionCacheV439(),[id]:entry});
  try{window.localStorage.setItem(MOTION_ANALYSIS_KEY_V439,JSON.stringify(next));}
  catch{/* storage unavailable: fall back to V438 */}
  window.dispatchEvent(new Event(MOTION_ANALYSIS_EVENT_V439));
}
export function featuresForMotionsV439(motions:readonly InstalledCharacterMotion[],cache:MotionAnalysisCacheV439):Record<string,MotionFeaturesV439>{
  const result:Record<string,MotionFeaturesV439>=Object.create(null);
  for(const motion of motions){
    if(!validId(motion.id)||!own(cache,motion.id))continue;
    const entry=cache[motion.id];
    if(entry.status==="ok"&&entry.url===motion.url&&entry.features)result[motion.id]=entry.features;
  }
  return result;
}
