import type {Lyrics, LyricLine, LyricWord} from "@/types/music";
/** Author-created, explicit opt-in instructions; no lyrics text or GLB files persisted. */
export type RapGestureKindV414="head"|"arms"|"both";
export type RapGestureCueV414={lineIndex:number;wordIndex:number;startMs:number;kind:RapGestureKindV414;strength:number;durationMs:number;motionId:string};
export type RapGestureDocumentV414={version:1;trackId:string;avatarId:string;cues:RapGestureCueV414[]};
export type RapGestureSampleV414={head:number;arms:number;motionId:string;motionBlend:number;motionSec:number;active:boolean};
export const RAP_GESTURES_STORAGE_V414="sonic.rap.lyrics.gestures.v414";
export const RAP_GESTURES_CHANGE_V414="sonic:rap-lyrics-gestures-v414";
export const MAX_GESTURES_V414=160;
const empty:RapGestureSampleV414={head:1,arms:1,motionId:"",motionBlend:0,motionSec:0,active:false};
const finite=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const safeKey=(k:unknown)=>typeof k==="string"&&k.length>0&&k.length<=180&&!/[\u0000-\u001f]/.test(k);
const motionSafe=(m:unknown)=>typeof m==="string"&&(m===""||/^(embedded:\d{1,4}|installed:[\w.-]{1,100})$/.test(m));
export function normalizeRapGestureCueV414(raw:unknown):RapGestureCueV414|null{
  if(!raw||typeof raw!=="object")return null;
  const x=raw as Partial<RapGestureCueV414>;
  if(!Number.isInteger(x.lineIndex)||!Number.isInteger(x.wordIndex)||
    x.lineIndex! < 0||x.lineIndex! > 2000||x.wordIndex! < -1||x.wordIndex! > 250||
    !finite(x.startMs)||x.startMs<0||x.startMs>3.6e7||!motionSafe(x.motionId))return null;
  return {lineIndex:x.lineIndex!,wordIndex:x.wordIndex!,startMs:Math.round(x.startMs),kind:x.kind==="head"||x.kind==="arms"?x.kind:"both",strength:clamp(finite(x.strength)?x.strength:100,0,150),durationMs:Math.round(clamp(finite(x.durationMs)?x.durationMs:450,120,1500)),motionId:x.motionId??""};
}
export function normalizeRapGestureDocumentV414(raw:unknown):RapGestureDocumentV414|null{
 if(!raw||typeof raw!=="object")return null;
 const doc=raw as Partial<RapGestureDocumentV414>;
 if(!safeKey(doc.trackId)||!safeKey(doc.avatarId)||!Array.isArray(doc.cues))return null;
 const cues:RapGestureCueV414[]=[];
 for(const rawCue of doc.cues.slice(-MAX_GESTURES_V414*2)){
   const cue=normalizeRapGestureCueV414(rawCue);if(!cue)continue;
   const old=cues.findIndex(c=>c.lineIndex===cue.lineIndex&&c.wordIndex===cue.wordIndex);
   if(old>=0)cues.splice(old,1);
   cues.push(cue);
 }
 return {version:1,trackId:doc.trackId!,avatarId:doc.avatarId!,cues:cues.slice(-MAX_GESTURES_V414)};
}
export function sameRapGestureKeyV414(a:Pick<RapGestureCueV414,"lineIndex"|"wordIndex">,b:Pick<RapGestureCueV414,"lineIndex"|"wordIndex">):boolean{return a.lineIndex===b.lineIndex&&a.wordIndex===b.wordIndex;}
export function updateRapGestureDocumentV414(doc:RapGestureDocumentV414,cue:RapGestureCueV414|null,key:Pick<RapGestureCueV414,"lineIndex"|"wordIndex">):RapGestureDocumentV414{
 const next=doc.cues.filter(c=>!sameRapGestureKeyV414(c,key));
 return normalizeRapGestureDocumentV414({...doc,cues:cue?[...next,cue]:next})??doc;
}
const getWindow=(lyrics:Lyrics,lineIndex:number,wordIndex:number):{startMs:number;endMs:number}|null=>{
 if(!lyrics.synced||lineIndex<0||lineIndex>=lyrics.lines.length)return null;
 const line:LyricLine=lyrics.lines[lineIndex];
 if(!line.text?.trim()||!finite(line.startMs))return null;
 const next=lyrics.lines[lineIndex+1]?.startMs;
 const lineEnd=Math.min(finite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,finite(next)&&next>line.startMs?next:Infinity,line.startMs+15000);
 if(wordIndex===-1)return {startMs:line.startMs,endMs:lineEnd};
 const word:LyricWord|undefined=line.words?.[wordIndex];
 if(!word?.text?.trim()||!finite(word.startMs)||word.startMs<line.startMs||word.startMs>=lineEnd)return null;
 const nextWord=line.words?.[wordIndex+1]?.startMs;
 return {startMs:word.startMs,endMs:Math.min(lineEnd,finite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,finite(nextWord)&&nextWord>word.startMs?nextWord:Infinity,word.startMs+1600)};
};
export function anchorRapGestureV414(lyrics:Lyrics|null|undefined,lineIndex:number,wordIndex:number):number|null{
 if(!lyrics)return null;return getWindow(lyrics,lineIndex,wordIndex)?.startMs??null;
}
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
/** Deterministic authoring envelope, only applied to the exact timestamped word/line. */
export function sampleRapGestureV414(lyrics:Lyrics|null|undefined,doc:RapGestureDocumentV414|null|undefined,trackId:string|undefined,avatarId:string|undefined,ms:number,playing:boolean,reducedMotion:boolean,offsetMs=0,allowedMotionIds:ReadonlyArray<string>=[]):RapGestureSampleV414{
 if(!lyrics?.synced||!doc||doc.trackId!==trackId||doc.avatarId!==avatarId||!playing||reducedMotion||!finite(ms)||!finite(offsetMs))return empty;
 const t=ms+clamp(offsetMs,-2000,2000);
 for(const cue of doc.cues){
  const win=getWindow(lyrics,cue.lineIndex,cue.wordIndex);
  if(!win||Math.abs(win.startMs-cue.startMs)>5||t<win.startMs||t>=win.endMs)continue;
  const elapsed=t-win.startMs,dur=Math.min(cue.durationMs,win.endMs-win.startMs);
  if(dur<=0||elapsed>=dur)continue;
  const envelope=smooth(elapsed/Math.min(100,dur/3))*smooth((dur-elapsed)/Math.min(180,dur/3));
  const mult=1+clamp(cue.strength,0,150)/100*envelope*.5;
  // No arbitrary motion injection: live selection can use only clips already owned by the current V412 preset.
  const motionId=cue.motionId&&allowedMotionIds.includes(cue.motionId)?cue.motionId:"";
  return {head:cue.kind==="arms"?1:mult,arms:cue.kind==="head"?1:mult,motionId,motionBlend:motionId ? .85*envelope : 0,motionSec:elapsed/1000,active:true};
 }
 return empty;
}
export function applyRapGestureMotionV414<T extends {id:string;motionId:string;localSec:number;weight:number;rapGain:number}>(active:ReadonlyArray<T>,gesture:RapGestureSampleV414):T[]{
 if(!gesture.motionId||gesture.motionBlend<=0||!active.length)return [...active];
 const blend=clamp(gesture.motionBlend,0,.85);
 const baseline=active.reduce((n,c)=>n+c.rapGain*c.weight,0)/Math.max(.001,active.reduce((n,c)=>n+c.weight,0));
 return [...active.map(c=>({...c,weight:c.weight*(1-blend)})),{...active[0],id:"v414:manual-cue",motionId:gesture.motionId,weight:blend,localSec:gesture.motionSec,rapGain:baseline}];
}
export function loadRapGestureDocumentV414(trackId:string,avatarId:string):RapGestureDocumentV414{
 const blank:RapGestureDocumentV414={version:1,trackId,avatarId,cues:[]};
 if(typeof window==="undefined"||!safeKey(trackId)||!safeKey(avatarId))return blank;
 try{const raw=JSON.parse(window.localStorage.getItem(RAP_GESTURES_STORAGE_V414)??"[]");
   if(!Array.isArray(raw))return blank;
   return raw.map(normalizeRapGestureDocumentV414).find((d:RapGestureDocumentV414|null)=>d?.trackId===trackId&&d?.avatarId===avatarId)??blank;
 }catch{return blank;}
}
export function saveRapGestureDocumentV414(doc:RapGestureDocumentV414):boolean{
 if(typeof window==="undefined")return false;
 const safe=normalizeRapGestureDocumentV414(doc);if(!safe)return false;
 try{const raw=JSON.parse(window.localStorage.getItem(RAP_GESTURES_STORAGE_V414)??"[]");
  const others=(Array.isArray(raw)?raw:[]).map(normalizeRapGestureDocumentV414).filter((d:RapGestureDocumentV414|null)=>d&&(d.trackId!==safe.trackId||d.avatarId!==safe.avatarId)).slice(-39);
  window.localStorage.setItem(RAP_GESTURES_STORAGE_V414,JSON.stringify([...others,safe]));
  window.dispatchEvent(new Event(RAP_GESTURES_CHANGE_V414));return true;
 }catch{return false;}
}
