import type { Lyrics } from "@/types/music";
import type { CameraPose } from "./stageCameraPoseHelpersV289";
import type {VocalStyleV368} from "./vocalPerformanceV368";

export type VocalCameraModeV369="off"|"auto"|"performance";
const clamp=(x:number,min=0,max=1)=>Number.isFinite(x)?Math.min(max,Math.max(min,x)):min;
/** Only accent cues from timed lyrics; it does not detect singer identity from audio.
 * Auto favors long/ending/emphatic words to avoid repeated close-up cuts on rapid rap.
 */
export function planVocalCameraV369(lyrics:Lyrics|null,progressMs:number,playing:boolean,{
  mode="auto",style="auto",genre=null
}:{mode?:VocalCameraModeV369;style?:VocalStyleV368;genre?:string|null}={}):number {
  if(mode==="off"||!playing||!lyrics?.synced||!Number.isFinite(progressMs))return 0;
  // Locate the active word using only provider timestamps; line-only timing is insufficient.
  let li=-1,lo=0,hi=lyrics.lines.length-1;
  while(lo<=hi){const mid=(lo+hi)>>>1;if(lyrics.lines[mid].startMs<=progressMs){li=mid;lo=mid+1;}else hi=mid-1;}
  if(li<0)return 0;
  const line=lyrics.lines[li];
  const end=Math.min(line.endMs&&line.endMs>line.startMs?line.endMs:Infinity,
    lyrics.lines[li+1]?.startMs??Infinity,line.startMs+12000);
  if(progressMs>=end||!line.words?.length)return 0;
  const words=line.words;
  let wi=-1;
  for(let i=0;i<words.length;i++){
    if(Number.isFinite(words[i].startMs)&&words[i].startMs<=progressMs)wi=i;
    else if(words[i].startMs>progressMs)break;
  }
  if(wi<0)return 0;
  const timed=words[wi];
  const endWord=Math.min(end,timed.endMs!=null&&timed.endMs>timed.startMs?timed.endMs:Infinity,
    words[wi+1]?.startMs??Infinity,timed.startMs+2100);
  if(progressMs>=endWord||progressMs<timed.startMs)return 0;
  const word=timed.text.trim();
  if(!/[a-zäöüß]/i.test(word)||/^\[[^\]]+\]$/.test(word))return 0;
  if(mode==="performance")return .8;
  if(word.length<3)return 0;
  // Word-end, punctuation and length are typography heuristics, not audio inference.
  const punctuation=/[!?.,…:]$/.test(word);
  const phraseEnd=wi===words.length-1;
  const expressive=/[!?]/.test(word);
  return expressive?1:punctuation?.82:phraseEnd?.72:word.replace(/[^a-zäöüß]/gi,"").length>=7?.68:0;
}
/** A constrained, additive near-face shot. Call only on a camera's automatic path.
 * Composer and lyrics protection should be checked AFTER this function.
 */
export function composeVocalCameraV369(
  pose:CameraPose,focus:number,{duo=false,intensity=55,headY=null,lyricsProtected=false}:{
  duo?:boolean;intensity?:number;headY?:number|null;lyricsProtected?:boolean
  }={}
):CameraPose {
  const f=clamp(focus)*clamp(intensity/100);
  if(f<=.0001)return pose;
  const protectedGain=lyricsProtected?.55:1;
  const gain=f*protectedGain;
  const tx=pose.targetX??0,tz=pose.targetZ??0,ty=pose.targetY;
  const dx=pose.x-tx,dy=pose.y-ty,dz=pose.z-tz;
  const length=Math.max(.0001,Math.hypot(dx,dy,dz));
  const minDistance=duo?4.5:2.75;
  const newDistance=Math.max(minDistance,length*(1-(duo?.13:.27)*gain));
  const scale=newDistance/length;
  // A restrained vertical face anchor (never assume avatar rig proportions are standard).
  const headOffset=headY!==null&&Number.isFinite(headY)?clamp(headY-ty,-.2,.85):.37;
  const lookY=ty+headOffset*gain*(duo?.15:.38);
  return {
    ...pose, x:tx+dx*scale, y:lookY+dy*scale, z:tz+dz*scale,
    targetY:lookY, fov:clamp(pose.fov-(duo?1.5:3.5)*gain,28,80),
  };
}
/** Smooth camera performance transitions using a ref-held state; no per-frame React updates. */
export function approachVocalFocusV369(previous:number,target:number,dt:number):number {
  const step=clamp(dt,0,.1);
  const rate=target>previous?2.2:1.0;
  return clamp(previous+(clamp(target)-previous)*(1-Math.exp(-step*rate)));
}
export type VocalShotHoldStateV369={untilMs:number;lastProgressMs:number;strength:number};
export function newVocalShotHoldV369():VocalShotHoldStateV369 {
  return {untilMs:0,lastProgressMs:-1,strength:0};
}
/** Briefly sustain a shot through gaps between words. Seek/pause clears the hold. */
export function holdVocalShotV369(state:VocalShotHoldStateV369,requested:number,progressMs:number,playing:boolean):number {
  if(!playing||!Number.isFinite(progressMs)||progressMs<0 || (state.lastProgressMs>=0&&
    (progressMs<state.lastProgressMs-90||progressMs-state.lastProgressMs>2200))){
    state.untilMs=0;state.strength=0;state.lastProgressMs=Number.isFinite(progressMs)?progressMs:-1;
    return 0;
  }
  state.lastProgressMs=progressMs;
  if(requested>.01){
    state.untilMs=Math.max(state.untilMs,progressMs+850);
    state.strength=clamp(requested);
    return state.strength;
  }
  if(progressMs<state.untilMs)return state.strength*.75;
  state.strength=0;
  return 0;
}
