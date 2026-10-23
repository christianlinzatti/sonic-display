import type {Lyrics, LyricLine, LyricWord} from "@/types/music";
import type {AvatarRigTargets} from "./avatarRigController";
import {resolveVocalPerformanceV368, type VocalStyleV368, type VocalPerformanceCueV368} from "./vocalPerformanceV368";

/** Timed-text performance direction, not phoneme detection, singer isolation or gaze tracking. */
export type VocalStageCueV371 = {
  headPitch:number; headYaw:number; headTilt:number;
  eyeYaw:number; chestLean:number; leftArm:number; rightArm:number;
  confidence:"none"|"line"|"word"; mode:"silent"|"rap"|"singing"|"line";
  emphasis:number;
};
export type VocalStageOptionsV371 = {
  enabled?:boolean; reducedMotion?:boolean;
  style?:VocalStyleV368; genre?:string|null; strength?:number;
  avatarSlot?:number; eyeContact?:boolean; gestures?:boolean;
  partnerAttention?:number; authoredPriority?:boolean;
  baseCueV368?:VocalPerformanceCueV368;
};
export const NEUTRAL_VOCAL_STAGE_V371:VocalStageCueV371 = Object.freeze({
  headPitch:0,headYaw:0,headTilt:0,eyeYaw:0,chestLean:0,leftArm:0,rightArm:0,
  confidence:"none",mode:"silent",emphasis:0,
});
const bound=(x:number,lo:number,hi:number)=>Number.isFinite(x)?Math.max(lo,Math.min(hi,x)):lo;
const smooth=(x:number)=>{const y=bound(x,0,1);return y*y*(3-2*y);};
const vowels=(s:string)=>(s.match(/[aeiouäöü]+/gi)??[]).length;
function timedWord(lines:LyricLine[], ms:number):{word:LyricWord;start:number;end:number;first:boolean;last:boolean}|null{
  // The vocal resolver already validates the active word. Never fabricate timings.
  let index=-1;
  for(let i=0;i<lines.length;i++) {if(lines[i].startMs<=ms)index=i;else break;}
  if(index<0)return null;
  const line=lines[index];
  if(!line.words?.length)return null;
  const words=line.words.filter(w=>Number.isFinite(w.startMs)&&w.text.trim()).slice().sort((a,b)=>a.startMs-b.startMs);
  let active=-1;
  for(let i=0;i<words.length;i++){if(words[i].startMs<=ms)active=i;else break;}
  if(active<0)return null;
  const w=words[active];
  const end=Math.min(
    w.endMs!==null && w.endMs>w.startMs?w.endMs:Infinity,
    words[active+1]?.startMs??Infinity,
    line.endMs!==null && line.endMs>line.startMs?line.endMs:Infinity,
    lines[index+1]?.startMs??Infinity,w.startMs+2100,
    line.startMs+12000,
  );
  if(ms>=end||end<=w.startMs)return null;
  return {word:w,start:w.startMs,end,first:active===0,last:active===words.length-1};
}
/** Stateless and seek-safe: cue depends only on current song clock and word timestamps. */
export function resolveVocalStageCueV371(lyrics:Lyrics|null,progressMs:number,playing:boolean,options:VocalStageOptionsV371={}):VocalStageCueV371{
  if(!playing||options.enabled===false||options.reducedMotion||!lyrics?.synced||!Number.isFinite(progressMs))return NEUTRAL_VOCAL_STAGE_V371;
  const base=options.baseCueV368??resolveVocalPerformanceV368(lyrics,progressMs,playing,{style:options.style??"auto",genre:options.genre,avatarSlot:options.avatarSlot??0});
  if(base.confidence==="none"||base.style==="silent")return NEUTRAL_VOCAL_STAGE_V371;
  const strength=bound((options.strength??60)/100,0,1.5);
  const partner=1-.75*bound(options.partnerAttention??0,0,1);
  const clip=options.authoredPriority?.52:1;
  const intensity=strength*partner*clip;
  if(intensity<=0)return NEUTRAL_VOCAL_STAGE_V371;
  const slot=Math.abs(Math.trunc(options.avatarSlot??0));
  const side=slot%2===0?1:-1;
  const word=base.confidence==="word"?timedWord(lyrics.lines,progressMs):null;
  if(base.confidence==="word"&&!word)return NEUTRAL_VOCAL_STAGE_V371;
  if(!word){
    // Line-timed lyrics do not justify invented syllable gestures or deliberate eye contact.
    return {...NEUTRAL_VOCAL_STAGE_V371,confidence:"line",mode:"line",headPitch:.009*intensity*Math.sin(progressMs*.002)};
  }
  const phase=bound((progressMs-word.start)/(word.end-word.start),0,1);
  const entrance=smooth((progressMs-word.start)/85);
  const release=smooth((word.end-progressMs)/95);
  const envelope=entrance*release;
  const text=word.word.text.trim();
  const emph=/[!?]$/.test(text)||word.last?1:word.first ? .65 : 0;
  const rap=base.style==="rap";
  const pulse=rap?(.6+.4*Math.sin(Math.PI*phase*Math.min(5,Math.max(1,vowels(text))))**2):Math.sin(Math.PI*phase)*.6+.4;
  const emphasis=envelope*intensity*(.32+.68*emph)*pulse;
  // Preserve authored choreography and partner looks. No >0.16 rad motions.
  const headPitch=(rap?-.078:-.046)*emphasis;
  const headYaw=(options.eyeContact===false?0:1)*side*(rap?.045:.018)*emphasis;
  const headTilt=side*(rap?.022:.034)*emphasis;
  const eyeYaw=options.eyeContact===false?0:-headYaw*.60 -side*.020*emphasis;
  const gesture=options.gestures===false?0:emphasis*(rap?.16:.095);
  return {
    headPitch,headYaw,headTilt,eyeYaw,
    chestLean:options.gestures===false?0:(rap?-.040:.028)*emphasis,
    leftArm:gesture===0?0:(side===1?-gesture:-gesture*.32),
    rightArm:gesture===0?0:(side===-1?gesture:gesture*.32),
    confidence:"word",mode:rap?"rap":"singing",emphasis,
  };
}

type Axis ="x"|"y"|"z";
type Target = keyof AvatarRigTargets;
type Channel = {slot:Target;axis:Axis;value:keyof Pick<VocalStageCueV371,"headPitch"|"headYaw"|"headTilt"|"eyeYaw"|"chestLean"|"leftArm"|"rightArm">;share:number};
const CHANNELS:readonly Channel[]=[
  {slot:"head",axis:"x",value:"headPitch",share:1},
  {slot:"head",axis:"y",value:"headYaw",share:1},
  {slot:"head",axis:"z",value:"headTilt",share:1},
  {slot:"neck",axis:"x",value:"headPitch",share:.25},
  {slot:"leftEye",axis:"y",value:"eyeYaw",share:1},
  {slot:"rightEye",axis:"y",value:"eyeYaw",share:1},
  {slot:"chest",axis:"x",value:"chestLean",share:1},
  {slot:"leftArm",axis:"z",value:"leftArm",share:1},
  {slot:"rightArm",axis:"z",value:"rightArm",share:1},
];
export type VocalStageOverlayV371 = {values:Record<string,number>;lastRig:AvatarRigTargets|null};
export const createVocalStageOverlayV371=():VocalStageOverlayV371=>({values:{},lastRig:null});
/** Called *after* animation and other additive rig cues. Delta-based offsets, no rotation resets. */
export function applyVocalStageOverlayV371(targets:AvatarRigTargets,cue:VocalStageCueV371,dt:number,state:VocalStageOverlayV371):void{
  if(state.lastRig!==targets){state.values={};state.lastRig=targets;}
  const delta=bound(dt,0,.1);
  for(const {slot,axis,value,share} of CHANNELS){
    const node=targets[slot];if(!node)continue;
    const key=`${slot}.${axis}`;
    const before=state.values[key]??0;
    const desired=cue[value]*share;
    const speed=Math.abs(desired)>Math.abs(before)?15:11;
    const next=before+(desired-before)*(1-Math.exp(-speed*delta));
    node.rotation[axis]+=next-before;
    state.values[key]=next;
  }
}
